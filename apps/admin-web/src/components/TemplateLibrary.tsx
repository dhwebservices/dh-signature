import type { SignatureTemplate } from '@dh-signature/shared-types'

export function TemplateLibrary({
  templates,
  activeTemplateId,
  onSelect,
}: {
  templates: SignatureTemplate[]
  activeTemplateId: string
  onSelect: (templateId: string) => void
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Template library</div>
          <div className="panel-title">Signature layouts</div>
        </div>
      </div>
      <div className="template-grid">
        {templates.map((template) => (
          <button
            key={template.id}
            className={`template-card${template.id === activeTemplateId ? ' active' : ''}`}
            onClick={() => onSelect(template.id)}
          >
            <div className="template-card-top" style={{ background: `linear-gradient(135deg, ${template.accentColor}, ${template.secondaryColor})` }} />
            <div className="template-card-body">
              <div className="template-name">{template.name}</div>
              <div className="template-meta">{template.tone} layout</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
