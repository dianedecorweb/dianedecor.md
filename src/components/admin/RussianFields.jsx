import Input, { FieldError, FieldHint, FieldLabel } from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

/**
 * Traducerile pentru /ru, strânse sub un singur titlu pliabil, ca formularul
 * românesc să rămână la fel de scurt. Se deschide singur când are ceva scris
 * sau o eroare. `field` e același ajutor pe care îl folosește formularul.
 */
export default function RussianFields({ fields, field, errors }) {
  const isOpen = fields.some(({ name }) => field(name).value || errors[name])

  return (
    <details open={isOpen} className="border border-line bg-paper px-5 py-4 md:col-span-2">
      <summary className="cursor-pointer text-sm font-medium text-ink">Traducere în rusă (opțional)</summary>
      <p className="mt-2 text-sm text-muted">
        Apare pe varianta rusă a site-ului (/ru). Ce lași gol se afișează acolo în română.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {fields.map(({ name, label, rows, hint }) => (
          <div key={name}>
            <FieldLabel htmlFor={name} optional>
              {label}
            </FieldLabel>
            {rows ? (
              <Textarea {...field(name)} value={field(name).value ?? ''} rows={rows} lang="ru" className="mt-2" />
            ) : (
              <Input {...field(name)} value={field(name).value ?? ''} type="text" lang="ru" className="mt-2" />
            )}
            {hint ? <FieldHint id={`${name}-hint`}>{hint}</FieldHint> : null}
            <FieldError id={`${name}-error`}>{errors[name]}</FieldError>
          </div>
        ))}
      </div>
    </details>
  )
}
