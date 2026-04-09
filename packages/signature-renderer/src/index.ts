import type { RenderedSignature, SignatureAssignment, SocialLink } from '@dh-signature/shared-types'

export const SIGNATURE_MARKER = 'DH_SIGNATURE_V1'

function socialIcon(link: SocialLink) {
  switch (link.platform) {
    case 'instagram':
      return `
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
          <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor"/>
        </svg>
      `
    case 'facebook':
      return `
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.3 20V12.7H15.8L16.2 9.9H13.3V8.15C13.3 7.34 13.54 6.78 14.72 6.78H16.3V4.25C15.53 4.16 14.75 4.12 13.97 4.13C11.66 4.13 10.08 5.48 10.08 7.96V9.9H7.7V12.7H10.08V20H13.3Z" fill="currentColor"/>
        </svg>
      `
    case 'linkedin':
      return `
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="9" width="3.2" height="11" fill="currentColor"/>
          <circle cx="5.6" cy="5.9" r="1.8" fill="currentColor"/>
          <path d="M10 9H13.1V10.6H13.15C13.58 9.78 14.64 8.92 16.2 8.92C19.46 8.92 20 11 20 13.72V20H16.8V14.44C16.8 13.12 16.77 11.43 14.96 11.43C13.13 11.43 12.85 12.84 12.85 14.34V20H9.65V9H10Z" fill="currentColor"/>
        </svg>
      `
    case 'whatsapp':
      return `
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 11.9C20 16.22 16.47 19.7 12.12 19.7C10.73 19.7 9.42 19.35 8.27 18.73L4.5 19.93L5.73 16.29C5.05 15.1 4.67 13.72 4.67 12.25C4.67 7.93 8.2 4.45 12.55 4.45C16.9 4.45 20 7.58 20 11.9Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M9.38 8.9C9.64 8.34 9.91 8.33 10.13 8.34C10.31 8.35 10.52 8.35 10.72 8.35C10.92 8.35 11.24 8.27 11.55 8.63C11.85 8.98 12.57 10.17 12.57 10.22C12.57 10.27 12.62 10.38 12.53 10.54C12.45 10.7 12.4 10.78 12.25 10.95C12.1 11.12 11.95 11.28 11.82 11.41C11.67 11.55 11.52 11.71 11.69 11.99C11.86 12.27 12.46 13.22 13.32 13.98C14.43 14.95 15.37 15.25 15.66 15.38C15.95 15.51 16.12 15.49 16.27 15.32C16.42 15.15 16.94 14.55 17.11 14.26C17.28 13.98 17.46 14.03 17.71 14.13C17.96 14.23 19.29 14.87 19.57 15.01C19.85 15.16 20.03 15.23 20.1 15.35C20.17 15.48 20.17 16.05 19.92 16.75C19.67 17.44 18.47 18.1 17.92 18.16C17.38 18.23 16.7 18.45 14.42 17.46C12.14 16.48 10.55 14.11 10.43 13.94C10.31 13.78 9.52 12.72 9.25 11.8C8.98 10.88 9.11 9.47 9.38 8.9Z" fill="currentColor"/>
        </svg>
      `
  }
}

function socialBadge(link: SocialLink) {
  return `
    <a href="${link.href}" aria-label="${link.label}" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;background:rgba(20,31,61,0.06);text-decoration:none;color:#243047;">
      ${socialIcon(link)}
    </a>
  `
}

export function renderSignature({ profile, template, branding, banner }: SignatureAssignment): RenderedSignature {
  const departmentChip = template.showDepartmentChip
    ? `<div style="display:inline-flex;padding:5px 10px;border-radius:999px;background:${template.accentColor}12;color:${template.accentColor};font-size:11px;font-weight:600;margin-top:8px;">${profile.department}</div>`
    : ''

  const bookingCta = template.showBookingCta
    ? `<a href="${profile.bookingUrl}" style="display:inline-flex;align-items:center;justify-content:center;height:38px;padding:0 16px;border-radius:999px;background:${template.accentColor};color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;">${branding.bookingLabel}</a>`
    : ''

  const workplaceLink = template.showWorkplaceLink
    ? `<a href="${profile.workplaceUrl}" style="color:${template.secondaryColor};text-decoration:none;">${branding.workplaceLabel}</a>`
    : ''

  const bannerHtml = bannerBlock(profile.bookingUrl, template.accentColor, banner)

  const disclaimerHtml = `
    <div style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(18,32,63,0.12);font-size:11px;line-height:1.55;color:#5b6475;">
      <div style="margin-bottom:8px;">
        <strong style="color:#243047;">CONFIDENTIALITY NOTICE:</strong> This email (and any attachments) is intended only for the named recipient(s) and may contain confidential and/or legally privileged information. If you are not the intended recipient, please notify the sender immediately, delete this email from your system, and do not copy, disclose, or use its contents.
      </div>
      <div style="margin-bottom:8px;">
        <strong style="color:#243047;">SECURITY:</strong> Please do not open attachments or click links unless you recognise the sender and were expecting the message.
      </div>
      <div>
        <strong style="color:#243047;">PRIVACY:</strong> ${branding.companyName} processes personal data in accordance with its <a href="${branding.privacyPolicyUrl}" style="color:${template.secondaryColor};text-decoration:none;">${branding.privacyPolicyLabel}</a>.
      </div>
    </div>
  `.trim()

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#1f2430;max-width:620px;">
      <!-- ${SIGNATURE_MARKER} -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <td style="vertical-align:top;padding-right:18px;width:88px;">
            <div style="width:64px;height:64px;border-radius:18px;background:linear-gradient(180deg,#3c67f4 0%,#1d2f75 100%);display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 14px 28px rgba(38,65,147,0.2);">
              <img src="${branding.logoUrl}" alt="${branding.companyName}" width="42" height="42" style="display:block;width:42px;height:42px;object-fit:contain;" />
            </div>
          </td>
          <td style="vertical-align:top;">
            <div style="font-size:24px;line-height:1.05;font-weight:700;letter-spacing:-0.03em;">${profile.fullName}</div>
            <div style="font-size:14px;color:#4c5568;margin-top:5px;">${profile.title}</div>
            ${departmentChip}
            <div style="height:14px"></div>
            <div style="font-size:13px;line-height:1.8;color:#334155;">
              <strong style="font-weight:600;">P</strong> <a href="tel:${profile.businessLandline}" style="color:${template.secondaryColor};text-decoration:none;">${profile.businessLandline}</a><br />
              <strong style="font-weight:600;">W</strong> <a href="${profile.websiteUrl}" style="color:${template.secondaryColor};text-decoration:none;">${branding.companyWebsiteLabel}</a><br />
              ${workplaceLink ? `<strong style="font-weight:600;">D</strong> ${workplaceLink}<br />` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px;">
              ${bookingCta}
              <div style="display:flex;gap:8px;">
                ${profile.socialLinks.map(socialBadge).join('')}
              </div>
            </div>
            ${bannerHtml}
            ${disclaimerHtml}
          </td>
        </tr>
      </table>
    </div>
  `.trim()

  const plainText = [
    `[${SIGNATURE_MARKER}]`,
    profile.fullName,
    profile.title,
    profile.department,
    `P ${profile.businessLandline}`,
    branding.companyWebsiteLabel,
    template.showWorkplaceLink ? branding.workplaceLabel : '',
    template.showBookingCta ? branding.bookingLabel : '',
    ...profile.socialLinks.map((link) => `${link.label}: ${link.href}`),
    banner?.headline || '',
    banner?.body || '',
    banner ? `${banner.ctaLabel}: ${banner.ctaHref}` : '',
    '',
    'CONFIDENTIALITY NOTICE: This email (and any attachments) is intended only for the named recipient(s) and may contain confidential and/or legally privileged information. If you are not the intended recipient, please notify the sender immediately, delete this email from your system, and do not copy, disclose, or use its contents.',
    'SECURITY: Please do not open attachments or click links unless you recognise the sender and were expecting the message.',
    `PRIVACY: ${branding.companyName} processes personal data in accordance with its ${branding.privacyPolicyLabel}: ${branding.privacyPolicyUrl}`,
  ].filter(Boolean).join('\n')

  return { html, plainText }
}

function bannerBlock(defaultHref: string, accentColor: string, banner?: SignatureAssignment['banner']) {
  if (!banner) return ''
  return `
    <div style="margin-top:16px;padding:16px 18px;border-radius:18px;background:linear-gradient(135deg, ${accentColor}16, rgba(15,159,127,0.12));border:1px solid ${accentColor}26;">
      <div style="font-size:14px;line-height:1.25;font-weight:700;color:#1f2430;">${banner.headline}</div>
      <div style="font-size:12px;line-height:1.55;color:#526079;margin-top:6px;max-width:420px;">${banner.body}</div>
      <a href="${banner.ctaHref || defaultHref}" style="display:inline-flex;align-items:center;justify-content:center;height:34px;padding:0 14px;border-radius:999px;background:${accentColor};color:#ffffff;text-decoration:none;font-size:12px;font-weight:600;margin-top:12px;">${banner.ctaLabel}</a>
    </div>
  `.trim()
}
