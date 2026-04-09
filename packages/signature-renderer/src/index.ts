import type { RenderedSignature, SignatureAssignment, SocialLink } from '@dh-signature/shared-types'

function socialBadge(link: SocialLink) {
  return `
    <a href="${link.href}" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;background:rgba(20,31,61,0.06);text-decoration:none;color:#243047;font-size:12px;font-weight:600;">
      ${link.label.slice(0, 2).toUpperCase()}
    </a>
  `
}

export function renderSignature({ profile, template, branding }: SignatureAssignment): RenderedSignature {
  const departmentChip = template.showDepartmentChip
    ? `<div style="display:inline-flex;padding:5px 10px;border-radius:999px;background:${template.accentColor}12;color:${template.accentColor};font-size:11px;font-weight:600;margin-top:8px;">${profile.department}</div>`
    : ''

  const bookingCta = template.showBookingCta
    ? `<a href="${profile.bookingUrl}" style="display:inline-flex;align-items:center;justify-content:center;height:38px;padding:0 16px;border-radius:999px;background:${template.accentColor};color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;">${branding.bookingLabel}</a>`
    : ''

  const workplaceLink = template.showWorkplaceLink
    ? `<a href="${profile.workplaceUrl}" style="color:${template.secondaryColor};text-decoration:none;">${branding.workplaceLabel}</a>`
    : ''

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#1f2430;max-width:620px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <td style="vertical-align:top;padding-right:20px;">
            <div style="width:58px;height:58px;border-radius:18px;background:linear-gradient(145deg, ${template.accentColor}, ${template.secondaryColor});display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:700;">
              ${branding.logoMark}
            </div>
          </td>
          <td style="vertical-align:top;">
            <div style="font-size:24px;line-height:1.05;font-weight:700;letter-spacing:-0.03em;">${profile.fullName}</div>
            <div style="font-size:14px;color:#4c5568;margin-top:5px;">${profile.title}</div>
            ${departmentChip}
            <div style="height:14px"></div>
            <div style="font-size:13px;line-height:1.8;color:#334155;">
              <strong style="font-weight:600;">T</strong> <a href="tel:${profile.workPhone}" style="color:${template.secondaryColor};text-decoration:none;">${profile.workPhone}</a><br />
              <strong style="font-weight:600;">B</strong> <a href="tel:${profile.businessLandline}" style="color:${template.secondaryColor};text-decoration:none;">${profile.businessLandline}</a><br />
              <strong style="font-weight:600;">W</strong> <a href="${profile.websiteUrl}" style="color:${template.secondaryColor};text-decoration:none;">${branding.companyWebsiteLabel}</a><br />
              ${workplaceLink ? `<strong style="font-weight:600;">D</strong> ${workplaceLink}<br />` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px;">
              ${bookingCta}
              <div style="display:flex;gap:8px;">
                ${profile.socialLinks.map(socialBadge).join('')}
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `.trim()

  const plainText = [
    profile.fullName,
    profile.title,
    profile.department,
    `T ${profile.workPhone}`,
    `B ${profile.businessLandline}`,
    branding.companyWebsiteLabel,
    template.showWorkplaceLink ? branding.workplaceLabel : '',
    template.showBookingCta ? branding.bookingLabel : '',
    ...profile.socialLinks.map((link) => `${link.label}: ${link.href}`),
  ].filter(Boolean).join('\n')

  return { html, plainText }
}
