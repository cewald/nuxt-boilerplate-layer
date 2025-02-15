import StoryblokClient from 'storyblok-js-client'
import type { SourceFile } from 'ts-morph'
import { Project, IndentationText, QuoteKind } from 'ts-morph'
import { pascalCase } from 'change-case'

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

export interface SbApiDatasourcesResponse {
  datasources: SbApiDatasource[]
}

export interface SbApiDatasource {
  id: number
  name: string
  slug: string
  dimensions: unknown[]
  created_at: string
  updated_at: string
}

export interface SbApiDatasourceEntriesResponse {
  datasource_entries: SbApiDatasourceEntry[]
}

export interface SbApiDatasourceEntry {
  id: number
  name: string
  value: string
  dimensions_value: unknown
}

export interface SbApiDatasourceEntryExt extends SbApiDatasourceEntry {
  datasourceId: number
  datasourceSlug: string
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
  datasource_slug?: string
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
  protected datasources: SbApiDatasource[] = []
  protected datasourceEntries: SbApiDatasourceEntryExt[] = []

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

  protected async fetchDatasources() {
    return await this.api.get(`spaces/${this.spaceId}/datasources`)
      .then(({ data }: { data: SbApiDatasourcesResponse }) => {
        this.datasources = data.datasources
      })
      .catch(error => {
        console.error('Error fetching datasources:', error)
        this.components = []
      })
  }

  protected async fetchDatasourceEntries(id: number, slug: string) {
    return await this.api.get(`spaces/${this.spaceId}/datasource_entries/?datasource_id=${id}`)
      .then(({ data }: { data: SbApiDatasourceEntriesResponse }) => {
        this.datasourceEntries.push(...data.datasource_entries
          .map(entry => ({ ...entry, datasourceId: id, datasourceSlug: slug })))
      })
      .catch(error => {
        console.error('Error fetching datasource-entries:', error)
        this.components = []
      })
  }

  protected async getComponents() {
    if (this.components.length === 0) {
      await this.fetchComponents()
    }
    return this.components
  }

  protected async getDatasources() {
    if (this.datasources.length === 0) {
      await this.fetchDatasources()
      const entryPromises = this.datasources.map(ds => this.fetchDatasourceEntries(ds.id, ds.slug))
      await Promise.all(entryPromises)
    }
    return this.datasources
  }

  protected getDatasource(slug: string) {
    const entries = this.datasourceEntries.filter(entry => entry.datasourceSlug === slug)
    return entries.length > 0 ? this.datasourceEntries.filter(entry => entry.datasourceSlug === slug) : null
  }

  protected getComponentNames(components: SbApiComponent<SbApiComponentSchema>[]) {
    return components.map(component => component.name)
  }

  protected getAllComponentNames() {
    return this.getComponentNames(this.components)
  }

  protected getTypeNameByComponentName(name: string) {
    return this.typePrefix + pascalCase(name)
  }

  protected mapComponentFieldToProperty(schema: SbApiComponentSchema) {
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
      case 'option': {
        const s = schema as SbApiComponentSchemaOptions
        if (s?.datasource_slug) {
          return this.getDatasource(s.datasource_slug)
            ?.map(e => `'${e.value}'`).join(' | ') || 'string'
        }
        return s?.options?.map(o => `'${o.value}'`).join(' | ') || 'string'
      }
      case 'options':{
        const s = schema as SbApiComponentSchemaOptions
        if (s?.datasource_slug) {
          return '('
            + (this.getDatasource(s.datasource_slug)?.map(e => `'${e.value}'`).join(' | ') || 'string')
            + ')[]'
        }
        return '('
          + (s?.options?.map(o => `'${o.value}'`).join(' | ') || 'string')
          + ')[]'
      }
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
              return `(${[ ...getComponentsWithFolders ].join('\n  | ')})[]`
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
              const value = getComponentsWithTags.size > 0 ? [ ...getComponentsWithTags ].join('\n  | ') : 'string'
              return `(${value})[]`
            }
            case '': {
              const getComponents = blockSchema.component_whitelist
                .map(c => this.getTypeNameByComponentName(c))
                .join('\n  | ')
              return `(${getComponents})[]`
            }
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
        return 'SbTable'
      default:
        return 'unknown'
    }
  }

  public async generateTypes() {
    await this.getDatasources()
    const components = await this.getComponents()

    const baseImport = this.types.addImportDeclaration({
      moduleSpecifier: './storyblok.components.base',
      namedImports: [ 'SbComponent' ],
      isTypeOnly: true,
    })
    baseImport.replaceWithText(baseImport.getText().replace(';', ''))

    if (components.length === 0) {
      return this.types.getText()
    }

    const nestableComponents = components.filter(c => c.is_nestable)
    const contentTypeComponents = components.filter(c => !c.is_nestable)

    const commonTypeFactory = (components: SbApiComponent[], name?: string) => (components.length > 0
      ? [
          {
            isExported: true,
            name: 'Sb' + (name || '') + 'ComponentNames',
            type: this.getComponentNames(components).map(n => `'${n}'`).join('\n| '),
          },
          {
            isExported: true,
            name: 'Sb' + (name || '') + 'Components',
            type: components.map(c => this.getTypeNameByComponentName(c.name)).join('\n| '),
          },
        ]
      : [])

    const nameTypes = this.types
      .addTypeAliases([
        ...commonTypeFactory(this.components),
        ...commonTypeFactory(nestableComponents, 'Nestable'),
        ...commonTypeFactory(contentTypeComponents, 'ContentType'),
      ])
    nameTypes.forEach(type => type.replaceWithText(type.getText().replace(';', '')))

    components.forEach(component => {
      const properties: Record<string, string> = {}
      for (const [ name, schema ] of Object.entries(component.schema)) {
        const propertyType = this.mapComponentFieldToProperty(schema)
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
