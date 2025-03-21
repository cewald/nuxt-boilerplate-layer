import dayjs from 'dayjs'

export const useDayJS = () => {
  const { dayjs: dayjsConfig } = useAppConfig()
  const defaultDateFormat = dayjsConfig.defaultDateFormat || 'YYYY-MM-DD'

  const toDate = (date: string) => {
    return dayjs(date)
  }

  const formatDate = (date: string | dayjs.Dayjs, format: string = defaultDateFormat) => {
    if (!(date instanceof dayjs)) date = dayjs(date)
    return date.format(format)
  }

  const currentDateInFormat = (format: string = defaultDateFormat) => {
    return formatDate(now(), format)
  }

  const now = () => dayjs()

  return { dayjs, defaultDateFormat, now, currentDateInFormat, toDate, formatDate }
}
