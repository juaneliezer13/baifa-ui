/**
 * Utilidades centralizadas de formateo y validación para todos los formularios de BaiFa Power Tracking
 * Formatos soportados:
 * - RIF Venezolano: J-12345678-9, G-20001234-5, V-12345678-0, E-81234567-1, C-12345678-9, P-12345678-9
 * - Cédula de Identidad: V-12345678, E-81234567 (6 a 9 dígitos)
 * - Teléfono: 0412/0414/0424/0416/0426/0422/02XX (ej. 0414-1234567, 0212-5551234, +58 414-1234567)
 * - Correo Electrónico: usuario@dominio.ext
 * - Nombres de personas, razones sociales, seriales de generadores, capacidad kVA y archivos de imagen
 */

export const RIF_OR_CEDULA_REGEX = /^(?:[JGVECP]-\d{8,9}-\d|[VE]-\d{6,9})$/i
export const PHONE_REGEX = /^(?:(?:\+?58[\s\-]?)?0?(?:2\d{2}|4(?:12|14|16|22|24|26))[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}|\+\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4})$/
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
export const PERSON_NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'\-]{3,150}$/
export const SERIAL_NUMBER_REGEX = /^[A-Z0-9][A-Z0-9\-_\/]{2,49}$/

/**
 * Auto-formatea un RIF o Cédula de Identidad mientras el usuario escribe
 */
export const formatRifOrCedula = (raw: string): string => {
  const cleaned = raw.toUpperCase().replace(/[^JGVECP0-9\-]/g, '')
  if (!cleaned) return ''

  const matchLetter = cleaned.match(/^[JGVECP]/)
  if (!matchLetter) {
    return cleaned.slice(0, 14)
  }

  const prefix = matchLetter[0]
  const digits = cleaned.slice(1).replace(/\D/g, '').slice(0, 10)

  if (!digits) {
    return `${prefix}-`
  }

  // Para personas jurídicas/gubernamentales (J, G, C, P): formato RIF X-12345678-9
  if (['J', 'G', 'C', 'P'].includes(prefix)) {
    if (digits.length <= 8) {
      return `${prefix}-${digits}`
    }
    const body = digits.slice(0, digits.length - 1)
    const check = digits.slice(-1)
    return `${prefix}-${body}-${check}`
  }

  // Para V o E: puede ser Cédula (V-12345678, 6-8 dígitos) o RIF Personal (V-12345678-0, 9-10 dígitos)
  const dashCount = (cleaned.match(/\-/g) || []).length
  if (digits.length >= 9 || (dashCount >= 2 && digits.length >= 7)) {
    const body = digits.slice(0, digits.length - 1)
    const check = digits.slice(-1)
    return `${prefix}-${body}-${check}`
  }

  return `${prefix}-${digits}`
}

/**
 * Valida formato de RIF o Cédula Venezolana
 */
export const validateRifOrCedula = (value: string, required = true): string | null => {
  const trimmed = value.trim().toUpperCase()
  if (!trimmed) {
    return required ? 'El número de RIF o Cédula es obligatorio.' : null
  }

  if (!RIF_OR_CEDULA_REGEX.test(trimmed)) {
    return 'Formato inválido. Usa RIF (ej. J-12345678-9) o Cédula (ej. V-12345678).'
  }

  return null
}

/**
 * Auto-formatea un número telefónico venezolano o internacional mientras el usuario escribe
 */
export const formatPhone = (raw: string): string => {
  const cleaned = raw.replace(/[^0-9+\-\s()]/g, '')
  const digitsOnly = cleaned.replace(/\D/g, '')

  if (!cleaned.startsWith('+') && (digitsOnly.startsWith('02') || digitsOnly.startsWith('04'))) {
    const limited = digitsOnly.slice(0, 11)
    if (limited.length > 4) {
      return `${limited.slice(0, 4)}-${limited.slice(4)}`
    }
    return limited
  }

  return cleaned.slice(0, 20)
}

/**
 * Valida formato de teléfono venezolano (0412, 0414, 0424, 0416, 0426, 02XX) o internacional (+58...)
 */
export const validatePhone = (value: string, required = false): string | null => {
  const trimmed = value.trim()
  if (!trimmed) {
    return required ? 'El número de teléfono es obligatorio.' : null
  }

  if (!PHONE_REGEX.test(trimmed)) {
    return 'Teléfono inválido. Usa un formato válido (ej. 0414-1234567, 0212-5551234 o +58 414-1234567).'
  }

  return null
}

/**
 * Valida formato estricto de correo electrónico
 */
export const validateEmail = (value: string, required = true): string | null => {
  const trimmed = value.trim()
  if (!trimmed) {
    return required ? 'El correo electrónico es obligatorio.' : null
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Ingresa un correo electrónico válido (ej. usuario@empresa.com).'
  }

  return null
}

/**
 * Valida nombre y apellido de persona (sin números ni símbolos inválidos)
 */
export const validatePersonName = (value: string, label = 'El nombre completo'): string | null => {
  const trimmed = value.trim()
  if (!trimmed) {
    return `${label} es obligatorio.`
  }
  if (trimmed.length < 3) {
    return `${label} debe tener al menos 3 caracteres.`
  }
  if (!PERSON_NAME_REGEX.test(trimmed)) {
    return `${label} solo puede contener letras y espacios.`
  }
  return null
}

/**
 * Valida razón social o nombre corto de empresa
 */
export const validateCompanyName = (value: string, minLength = 3, label = 'La razón social'): string | null => {
  const trimmed = value.trim()
  if (!trimmed) {
    return `${label} es obligatorio.`
  }
  if (trimmed.length < minLength) {
    return `${label} debe tener al menos ${minLength} caracteres.`
  }
  return null
}

/**
 * Auto-formatea el serial de un generador (mayúsculas, alfanumérico y guiones)
 */
export const formatSerialNumber = (raw: string): string => {
  return raw.toUpperCase().replace(/[^A-Z0-9\-_\/]/g, '').slice(0, 50)
}

/**
 * Valida el serial de fábrica de un generador
 */
export const validateSerialNumber = (value: string): string | null => {
  const trimmed = value.trim().toUpperCase()
  if (!trimmed) {
    return 'El serial de fábrica del generador es obligatorio.'
  }
  if (trimmed.length < 3) {
    return 'El serial debe tener al menos 3 caracteres (ej. GEN-2026-0041).'
  }
  if (!SERIAL_NUMBER_REGEX.test(trimmed)) {
    return 'El serial solo puede contener letras, números y guiones (ej. GEN-2026-0041).'
  }
  return null
}

/**
 * Valida la capacidad en kVA de un generador
 */
export const validateCapacityKva = (value: number | string | null | undefined, required = false): string | null => {
  if (value === null || value === undefined || value === '') {
    return required ? 'La capacidad en kVA es obligatoria.' : null
  }
  const num = Number(value)
  if (Number.isNaN(num) || num <= 0) {
    return 'La capacidad en kVA debe ser un número mayor a 0.'
  }
  if (num > 99999) {
    return 'La capacidad en kVA no puede superar 99,999 kVA.'
  }
  return null
}

/**
 * Valida archivo de imagen (JPEG, PNG, WebP hasta 5 MB)
 */
export const validateImageFile = (file: File | null | undefined, maxMb = 5): string | null => {
  if (!file) return null
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    return 'Formato de imagen no válido. Solo se permiten archivos JPEG, PNG o WebP.'
  }
  const maxBytes = maxMb * 1024 * 1024
  if (file.size > maxBytes) {
    return `La imagen supera el límite máximo permitido de ${maxMb} MB.`
  }
  return null
}
