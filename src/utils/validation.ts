import { useI18n } from 'vue-i18n'

// Centralized, i18n-aware validators for Vuetify rules
// Each factory returns a function (value) => true | string
export function useValidation() {
  const { t } = useI18n()

  const required = (messageKey = 'validation.required') => (v: any) =>
    (v !== null && v !== undefined && String(v).trim().length > 0) || t(messageKey)

  const email = () => (v: any) => {
    if (!v) return t('validation.required')
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(String(v)) || t('validation.email')
  }

  const minLength = (min: number) => (v: any) =>
    (!v && min === 0) || (String(v || '').length >= min) || t('validation.minLength', { min })

  const maxLength = (max: number) => (v: any) =>
    String(v || '').length <= max || t('validation.maxLength', { max })

  const lengthBetween = (min: number, max: number) => (v: any) => {
    const len = String(v || '').length
    return (len >= min && len <= max) || t('validation.lengthBetween', { min, max })
  }

  const pattern = (regex: RegExp, msgKey = 'validation.pattern') => (v: any) =>
    regex.test(String(v || '')) || t(msgKey)

  const url = () => (v: any) => {
    try {
      if (!v) return t('validation.required')
      new URL(String(v))
      return true
    } catch {
      return t('validation.url')
    }
  }

  const numeric = () => (v: any) =>
    (/^-?\d*(?:\.\d+)?$/.test(String(v))) || t('validation.numeric')

  const integer = () => (v: any) =>
    (/^-?\d+$/.test(String(v))) || t('validation.integer')

  const min = (minVal: number) => (v: any) =>
    (Number(v) >= minVal) || t('validation.min', { min: minVal })

  const max = (maxVal: number) => (v: any) =>
    (Number(v) <= maxVal) || t('validation.max', { max: maxVal })

  const between = (minVal: number, maxVal: number) => (v: any) => {
    const n = Number(v)
    return (n >= minVal && n <= maxVal) || t('validation.between', { min: minVal, max: maxVal })
  }

  const phone = () => (v: any) =>
    (/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(String(v || ''))) || t('validation.phone')

  const isDate = () => (v: any) => {
    if (!v) return t('validation.required')
    return !isNaN(Date.parse(String(v))) || t('validation.date')
  }

  const minDate = (minISO: string) => (v: any) => {
    const d = Date.parse(String(v))
    return (!isNaN(d) && d >= Date.parse(minISO)) || t('validation.minDate', { date: minISO })
  }

  const maxDate = (maxISO: string) => (v: any) => {
    const d = Date.parse(String(v))
    return (!isNaN(d) && d <= Date.parse(maxISO)) || t('validation.maxDate', { date: maxISO })
  }

  type PasswordStrengthOpts = { min?: number; upper?: boolean; lower?: boolean; number?: boolean; special?: boolean }
  const passwordStrength = (opts: PasswordStrengthOpts = { min: 8, upper: true, lower: true, number: true, special: true }) => (v: any) => {
    const val = String(v || '')
    if ((opts.min ?? 0) > 0 && val.length < (opts.min as number)) return t('validation.password.min', { min: opts.min })
    if (opts.upper && !/[A-Z]/.test(val)) return t('validation.password.upper')
    if (opts.lower && !/[a-z]/.test(val)) return t('validation.password.lower')
    if (opts.number && !/[0-9]/.test(val)) return t('validation.password.number')
    if (opts.special && !/[!@#$%^&*(),.?":{}|<>_\-\[\]\\/;'`~+=]/.test(val)) return t('validation.password.special')
    return true
  }

  // ----- Generic helpers -----
  const toFiles = (v: any): File[] => {
    if (!v) return []
    if (v instanceof File) return [v]
    if (Array.isArray(v)) return v.filter((f): f is File => f instanceof File)
    if (v instanceof FileList) return Array.from(v)
    return []
  }

  const getExt = (name: string) => name.split('.').pop()?.toLowerCase() || ''

  const loadImageDimensions = (file: File) => new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { const r = { width: img.naturalWidth, height: img.naturalHeight }; URL.revokeObjectURL(url); resolve(r) }
    img.onerror = e => { URL.revokeObjectURL(url); reject(e) }
    img.src = url
  })

  // ----- Extra primitives -----
  const oneOf = (allowed: (string|number|boolean)[]) => (v: any) => allowed.includes(v) || t('validation.oneOf', { values: allowed.join(', ') })
  const notOneOf = (blocked: (string|number|boolean)[]) => (v: any) => !blocked.includes(v) || t('validation.notOneOf', { values: blocked.join(', ') })
  const equals = (other: any) => (v: any) => String(v) === String(other) || t('validation.equals', { value: other })
  const notEquals = (other: any) => (v: any) => String(v) !== String(other) || t('validation.notEquals', { value: other })
  const requiredIf = (predicate: () => boolean) => (v: any) => (predicate() ? required()(v) : true)
  const json = () => (v: any) => { try { if (typeof v === 'string') JSON.parse(v); else JSON.stringify(v); return true } catch { return t('validation.json') } }
  const uuid = () => (v: any) => (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''))) || t('validation.uuid')
  const iban = () => (v: any) => (/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/i.test(String(v||''))) || t('validation.iban')
  const bic = () => (v: any) => (/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(String(v||''))) || t('validation.bic')
  const slug = () => (v: any) => (/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(String(v||''))) || t('validation.slug')
  const hexColor = () => (v: any) => (/^#?([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(String(v||''))) || t('validation.hexColor')
  const creditCard = () => (v: any) => { const s=String(v||'').replace(/\s|-/g,''); let sum=0, dbl=false; for(let i=s.length-1;i>=0;i--){let d=parseInt(s[i]); if(dbl){ d*=2; if(d>9) d-=9 } sum+=d; dbl=!dbl } return (s.length>=12&&sum%10===0)||t('validation.creditCard') }
  const postalCode = (re?: RegExp) => (v: any) => (re?re.test(String(v||'')):/^[A-Za-z0-9 \-]{3,10}$/.test(String(v||''))) || t('validation.postalCode')
  const timeHHmm = () => (v: any) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(String(v||''))) || t('validation.time')
  const booleanTrue = () => (v: any) => (!!v) || t('validation.accept')
  const afterDate = (getStart: () => any) => (v: any) => { const a=Date.parse(String(getStart()||'')); const b=Date.parse(String(v||'')); return (!isNaN(a)&&!isNaN(b)&&b>=a) || t('validation.afterDate') }
  const beforeDate = (getEnd: () => any) => (v: any) => { const a=Date.parse(String(v||'')); const b=Date.parse(String(getEnd()||'')); return (!isNaN(a)&&!isNaN(b)&&a<=b) || t('validation.beforeDate') }

  // ----- Files and images -----
  const fileRequired = () => (v: any) => (toFiles(v).length>0) || t('validation.file.required')
  const fileMaxSize = (maxBytes: number) => (v: any) => { for(const f of toFiles(v)){ if(f.size>maxBytes) return t('validation.file.maxSize', { name: f.name, max: maxBytes }) } return true }
  const fileMinSize = (minBytes: number) => (v: any) => { for(const f of toFiles(v)){ if(f.size<minBytes) return t('validation.file.minSize', { name: f.name, min: minBytes }) } return true }
  const fileMimeType = (allowed: string[]) => (v: any) => { const A=allowed.map(a=>a.toLowerCase()); for(const f of toFiles(v)){ if(!A.includes((f.type||'').toLowerCase())) return t('validation.file.mimeType', { name: f.name, types: allowed.join(', ') }) } return true }
  const fileExtension = (allowedExts: string[]) => (v: any) => { const E=allowedExts.map(e=>e.replace(/^\./,'').toLowerCase()); for(const f of toFiles(v)){ const ext=getExt(f.name); if(!E.includes(ext)) return t('validation.file.extension', { name: f.name, exts: allowedExts.join(', ') }) } return true }
  const filesMaxCount = (max: number) => (v: any) => (toFiles(v).length<=max) || t('validation.file.maxFiles', { max })
  const filesMinCount = (min: number) => (v: any) => (toFiles(v).length>=min) || t('validation.file.minFiles', { min })
  const filesTotalMaxSize = (maxBytes: number) => (v: any) => (toFiles(v).reduce((s,f)=>s+f.size,0)<=maxBytes) || t('validation.file.totalMaxSize', { max: maxBytes })
  const fileNotEmpty = () => (v: any) => { for(const f of toFiles(v)){ if(!f.size) return t('validation.file.emptyFile', { name: f.name }) } return true }
  const filenameSafe = () => (v: any) => { const bad=/[\\\/:*?"<>|]/; for(const f of toFiles(v)){ if(bad.test(f.name)) return t('validation.file.filenameSafe', { name: f.name }) } return true }
  const imageMaxDimensions = (maxW: number, maxH: number) => async (v: any) => { for (const f of toFiles(v)){ try{ const d=await loadImageDimensions(f); if(d.width>maxW||d.height>maxH) return t('validation.file.imageMaxDimensions', { name: f.name, w: maxW, h: maxH }) }catch{return t('validation.file.imageLoad') } } return true }
  const imageMinDimensions = (minW: number, minH: number) => async (v: any) => { for (const f of toFiles(v)){ try{ const d=await loadImageDimensions(f); if(d.width<minW||d.height<minH) return t('validation.file.imageMinDimensions', { name: f.name, w: minW, h: minH }) }catch{return t('validation.file.imageLoad') } } return true }
  const imageAspectRatioBetween = (min: number, max: number) => async (v: any) => { for(const f of toFiles(v)){ try{ const d=await loadImageDimensions(f); const r=d.width/d.height; if(r<min||r>max) return t('validation.file.imageAspectRatio', { name: f.name, min, max }) }catch{return t('validation.file.imageLoad') } } return true }

  const matches = (getTarget: () => any) => (v: any) =>
    (String(v ?? '') === String(getTarget() ?? '')) || t('validation.passwords_mismatch')

  return {
    // primitives
    required,
    email,
    minLength,
    maxLength,
    lengthBetween,
    pattern,
    url,
    numeric,
    integer,
    min,
    max,
    between,
    phone,
    isDate,
    minDate,
    maxDate,
    passwordStrength,
    matches,

    // extra primitives
    oneOf,
    notOneOf,
    equals,
    notEquals,
    requiredIf,
    json,
    uuid,
    iban,
    bic,
    slug,
    hexColor,
    creditCard,
    postalCode,
    timeHHmm,
    booleanTrue,
    afterDate,
    beforeDate,

    // files
    fileRequired,
    fileMaxSize,
    fileMinSize,
    fileMimeType,
    fileExtension,
    filesMaxCount,
    filesMinCount,
    filesTotalMaxSize,
    fileNotEmpty,
    filenameSafe,
    imageMaxDimensions,
    imageMinDimensions,
    imageAspectRatioBetween,
  }
}

