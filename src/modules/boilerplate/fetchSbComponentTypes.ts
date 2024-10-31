import StoryblokClient from 'storyblok-js-client'
import type { SourceFile } from 'ts-morph'
import { Project, IndentationText, QuoteKind } from 'ts-morph'

export interface SbApiComponentResponse {
  component_groups: SbApiComponentGroup[]
  components: SbApiComponent[]
}

export interface SbApiComponentGroup {
  id: number
  name: string
  uuid: string
  parent_id: number
  parent_uuid: string
}

export interface SbApiComponent<T = SbApiComponentSchema> {
  name: string
  display_name: string | null
  created_at: string
  updated_at: string
  id: number
  schema: Record<string, T>
  image: string | null
  preview_field: string | null
  is_root: boolean
  preview_tmpl: string | null
  is_nestable: boolean
  all_presets: unknown[]
  preset_id: unknown | null
  real_name: string
  component_group_uuid: string
  color: string | null
  icon: string | null
  internal_tags_list: { id: number, name: string }[]
  internal_tag_ids: string[]
  content_type_asset_preview: unknown | null
}

const componentFieldTypes = [
  'text',
  'textarea',
  'richtext',
  'markdown',
  'number',
  'datetime',
  'boolean',
  'option',
  'options',
  'asset',
  'multiasset',
  'multilink',
  'bloks',
  'table',
  'section',
] as const

type ComponentFieldTypes = typeof componentFieldTypes[number]

export type SbApiComponentSchemaBase = {
  type: ComponentFieldTypes
  required?: boolean
  translatable?: boolean
  display_name?: string
}

export type SbApiComponentSchemaOptions = SbApiComponentSchemaBase & {
  type: 'option' | 'options'
  options?: { uid: string, name: string, value: string }[]
}

export type SbApiComponentSchemaBloks = SbApiComponentSchemaBase & {
  type: 'bloks'
  restrict_components: boolean
  restrict_type: '' | 'groups' | 'tags'
  component_whitelist: string[]
  component_tag_whitelist: number[]
  component_group_whitelist: string[]
}

export type SbApiComponentSchema = SbApiComponentSchemaBase | SbApiComponentSchemaOptions | SbApiComponentSchemaBloks

export class SbComponentsToTypes {
  protected spaceId: number | string
  protected api: StoryblokClient

  protected typesProject: Project
  protected types: SourceFile
  protected typePrefix = 'SbComponent'

  protected components: SbApiComponent[] = []

  constructor(oauthToken: string, spaceId: number | string, region?: string) {
    this.spaceId = spaceId
    this.api = new StoryblokClient({ oauthToken, region })

    this.typesProject = new Project({ manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      useTrailingCommas: false,
      quoteKind: QuoteKind.Single,
    } })

    this.types = this.typesProject.createSourceFile('', '')
  }

  protected async fetchComponents() {
    return await this.api.get(`spaces/${this.spaceId}/components`)
      .then(({ data }: { data: SbApiComponentResponse }) => {
        this.components = data.components
      })
      .catch(error => {
        console.error('Error fetching components:', error)
        this.components = []
      })
  }

  protected async getComponents() {
    if (this.components.length === 0) {
      await this.fetchComponents()
    }
    return this.components
  }

  protected getAllComponentNames() {
    return this.components.map(component => component.name)
  }

  protected getTypeNameByComponentName(name: string) {
    return this.typePrefix + this.snakeToPascal(name)
  }

  protected snakeToPascal(snakeStr: string) {
    return snakeStr
      .toLowerCase()
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('')
  }

  protected mapComponentFieldToProperty(
    component: SbApiComponent,
    name: string,
    schema: SbApiComponentSchema
  ) {
    if (!componentFieldTypes.includes(schema.type) || schema.type === 'section') return

    switch (schema.type) {
      case 'text':
      case 'textarea':
      case 'datetime':
        return 'string'
      case 'number':
        return 'string'
      case 'boolean':
        return 'boolean'
      case 'option':
        return (schema as SbApiComponentSchemaOptions)?.options?.map(o => `'${o.value}'`).join(' | ') || 'string'
      case 'options':
        return '('
          + ((schema as SbApiComponentSchemaOptions)?.options?.map(o => `'${o.value}'`).join(' | ') || 'string')
          + ')[]'
      case 'richtext':
        return 'SbRichText'
      case 'asset':
        return 'SbImage'
      case 'multiasset':
        return 'SbImage[]'
      case 'bloks': {
        const blockSchema = schema as SbApiComponentSchemaBloks
        if (blockSchema?.restrict_components) {
          switch (blockSchema.restrict_type) {
            case 'groups':{
              const getComponentsWithFolders = blockSchema.component_group_whitelist
                .reduce((acc, folderId) => {
                  this.components
                    .filter(c => c.component_group_uuid === folderId)
                    .map(c => this.getTypeNameByComponentName(c.name))
                    .forEach(c => acc.add(c))
                  return acc
                }, new Set<string>())
              return [ ...getComponentsWithFolders ].join('\n  | ')
            }
            case 'tags': {
              const getComponentsWithTags = blockSchema.component_tag_whitelist
                .reduce((acc, tagId) => {
                  this.components
                    .filter(c => c.internal_tags_list.some(t => t.id === tagId))
                    .map(c => this.getTypeNameByComponentName(c.name))
                    .forEach(c => acc.add(c))
                  return acc
                }, new Set<string>())
              return [ ...getComponentsWithTags ].join('\n  | ')
            }
            case '':
              return blockSchema.component_whitelist
                .map(c => this.getTypeNameByComponentName(c))
                .join('\n  | ')
            default:
              return 'unknown'
          }
        }

        return this.getAllComponentNames()
          .map(c => this.getTypeNameByComponentName(c))
          .join(' | ')
      }
      case 'multilink':
        return 'SbLink'
      case 'markdown':
        return 'string'
      case 'table':
        return 'unknown'
      default:
        return 'unknown'
    }
  }

  public async generateTypes() {
    const components = await this.getComponents()

    const nameTypes = this.types
      .addTypeAliases([
        {
          isExported: true,
          name: 'SbComponentName',
          type: this.getAllComponentNames().map(n => `'${n}'`).join('\n| '),
        },
        {
          isExported: true,
          name: 'SbComponentAlias',
          type: this.components.map(c => this.getTypeNameByComponentName(c.name)).join('\n| '),
        },
      ])
    nameTypes.forEach(type => type.replaceWithText(type.getText().replace(';', '')))

    components.forEach(component => {
      const properties: Record<string, string> = {}
      for (const [ name, schema ] of Object.entries(component.schema)) {
        const propertyType = this.mapComponentFieldToProperty(component, name, schema)
        if (propertyType) {
          Object.assign(properties, { [name]: propertyType })
        }
      }

      const propString = Object.entries(properties)
        .map(([ key, value ]) => `${key}: ${value}`)
        .join('\n')

      const typeAlias = this.types.addTypeAlias({
        isExported: true,
        name: this.getTypeNameByComponentName(component.name),
        type: `SbComponent<'${component.name}', {\n${propString} }>`,
      })
      typeAlias.replaceWithText(typeAlias.getText().replace(';', ''))
    })

    return this.types.getText()
  }

  public addTypesToFile(filePath: string, types: string) {
    const source = this.typesProject.createSourceFile(filePath, '', { overwrite: true })
    source.addStatements(types)
    source.saveSync()
  }
}

export function sbComponentsToTypesFactory(oauthToken: string, spaceId: number | string, region?: string) {
  return new SbComponentsToTypes(oauthToken, spaceId, region)
}

export default sbComponentsToTypesFactory
