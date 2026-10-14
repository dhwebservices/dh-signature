import type { RenderedSignature, SignatureAssignment, SocialLink } from '@dh-signature/shared-types'

export const SIGNATURE_MARKER = 'DH_SIGNATURE_V1'

// Plain text links separated by dots, styled like a printed letterhead rather than app buttons
function socialLink(link: SocialLink, color: string) {
  return `<a href="${link.href}" style="color:${color};text-decoration:none;">${link.label}</a>`
}

function safeUrl(value: string, fallback = '') {
  if (!value) return fallback
  try {
    const url = new URL(value)
    return url.toString()
  } catch {
    return fallback
  }
}

function safeText(value: string, fallback = '') {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return trimmed || fallback
}

function normalizeHref(value: string, fallback = '') {
  const trimmed = safeText(value)
  if (!trimmed) return fallback
  if (/^https?:\/\//i.test(trimmed)) return safeUrl(trimmed, fallback)
  if (/^[a-z0-9.-]+\.[a-z]{2,}([/?#]|$)/i.test(trimmed)) return safeUrl(`https://${trimmed}`, fallback)
  return fallback
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function renderSignature({ profile, template, branding, banner }: SignatureAssignment): RenderedSignature {
  const fullName = safeText(profile.fullName, profile.email)
  const title = safeText(profile.title, 'Staff member')
  const department = safeText(profile.department)
  const businessLandline = safeText(profile.businessLandline, safeText(profile.workPhone))
  const websiteUrl = safeUrl(profile.websiteUrl, 'https://dhwebsiteservices.co.uk')
  const bookingUrl = safeUrl(profile.bookingUrl)
  const logoUrl = safeUrl(branding.logoUrl, 'https://sig.dhwebsiteservices.co.uk/icons/dh-logo-icon.png')
  const companyName = safeText(branding.companyName, 'DH Website Services')
  const companyWebsiteLabel = safeText(branding.companyWebsiteLabel, 'dhwebsiteservices.co.uk')
  const bookingLabel = safeText(branding.bookingLabel, 'Book a call')
  const privacyPolicyLabel = safeText(branding.privacyPolicyLabel, 'Privacy Policy')
  const privacyPolicyUrl = safeUrl(branding.privacyPolicyUrl, 'https://dhwebsiteservices.co.uk/privacy/')
  const awardTitle = safeText(branding.awardTitle || '')
  const awardSubtitle = safeText(branding.awardSubtitle || '')
  const awardUrl = safeUrl(branding.awardUrl || '', websiteUrl)
  const awardImageUrl = safeUrl(branding.awardImageUrl || '')
  const validSocialLinks = profile.socialLinks
    .map((link) => ({ ...link, href: normalizeHref(link.href) }))
    .filter((link) => link.href)
  const ink = '#1d1d1f'
  const muted = '#6e6e73'
  const rule = '#e5e5ea'
  const roleLine = [title, template.showDepartmentChip ? department : ''].filter(Boolean).map(escapeHtml).join(' &middot; ')

  const bookingLink =
    template.showBookingCta && bookingUrl
      ? `<a href="${bookingUrl}" style="color:${template.accentColor};text-decoration:none;font-weight:700;">${escapeHtml(bookingLabel)} &rarr;</a>`
      : ''

  const contactLine = [
    businessLandline
      ? `<a href="tel:${businessLandline.replace(/\s+/g, '')}" style="color:${ink};text-decoration:none;">${escapeHtml(businessLandline)}</a>`
      : '',
    `<a href="${websiteUrl}" style="color:${ink};text-decoration:none;">${escapeHtml(companyWebsiteLabel)}</a>`,
  ]
    .filter(Boolean)
    .join(`<span style="color:${rule};">&nbsp;&nbsp;|&nbsp;&nbsp;</span>`)

  const linksLine = [bookingLink, ...validSocialLinks.map((link) => socialLink(link, muted))]
    .filter(Boolean)
    .join(`<span style="color:#c7c7cc;">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>`)

  const awardRow = awardTitle
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12px;">
        <tr>
          ${awardImageUrl ? `<td style="vertical-align:middle;padding-right:10px;"><a href="${awardUrl}" style="text-decoration:none;"><img src="${awardImageUrl}" alt="${escapeHtml(awardSubtitle || awardTitle)}" width="40" height="37" style="display:block;width:40px;height:37px;border:0;" /></a></td>` : ''}
          <td style="vertical-align:middle;font-size:11px;line-height:1.45;color:${muted};">
            <span style="color:${ink};font-weight:700;">${escapeHtml(awardTitle)}</span>${awardSubtitle ? `<br /><span style="color:#d4541f;">${escapeHtml(awardSubtitle)}</span>` : ''}
          </td>
        </tr>
      </table>
    `
    : ''

  const bannerHtml = bannerBlock(profile.bookingUrl, template.accentColor, banner)

  const disclaimerHtml = `
    <div style="margin-top:16px;padding-top:10px;border-top:1px solid ${rule};font-size:9.5px;line-height:1.5;color:#8e8e93;max-width:560px;">
      This email and any attachments are confidential and intended only for the named recipient(s). If you received it in error, please tell the sender and delete it. Please do not open attachments or links you were not expecting. ${escapeHtml(companyName)} handles personal data in line with its <a href="${privacyPolicyUrl}" style="color:#8e8e93;text-decoration:underline;">${escapeHtml(privacyPolicyLabel)}</a>.
    </div>
  `.trim()

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:${ink};max-width:600px;">
      <!-- ${SIGNATURE_MARKER} -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="vertical-align:top;padding-right:14px;border-right:2px solid ${rule};">
            <img src="${logoUrl}" alt="${escapeHtml(companyName)}" width="48" height="48" style="display:block;width:48px;height:48px;border:0;" />
          </td>
          <td style="vertical-align:top;padding-left:14px;">
            <div style="font-size:16px;line-height:1.25;font-weight:700;color:${ink};">${escapeHtml(fullName)}</div>
            <div style="font-size:12px;line-height:1.5;color:${muted};">${roleLine}</div>
            <div style="font-size:12px;line-height:1.5;color:${ink};padding-top:8px;">${contactLine}</div>
            ${linksLine ? `<div style="font-size:12px;line-height:1.5;padding-top:2px;">${linksLine}</div>` : ''}
          </td>
        </tr>
      </table>
      ${awardRow}
      ${bannerHtml}
      ${disclaimerHtml}
    </div>
  `.trim()

  const plainText = [
    `[${SIGNATURE_MARKER}]`,
    fullName,
    title,
    department,
    businessLandline ? `P ${businessLandline}` : '',
    companyWebsiteLabel,
    awardTitle ? `${awardTitle}${awardSubtitle ? ` - ${awardSubtitle}` : ''}` : '',
    template.showBookingCta && bookingUrl ? bookingLabel : '',
    ...validSocialLinks.map((link) => `${link.label}: ${link.href}`),
    banner?.headline || '',
    banner?.body || '',
    banner ? `${banner.ctaLabel}: ${banner.ctaHref || bookingUrl}` : '',
    '',
    `This email and any attachments are confidential and intended only for the named recipient(s). If you received it in error, please tell the sender and delete it. ${companyName} handles personal data in line with its ${privacyPolicyLabel}: ${privacyPolicyUrl}`,
  ].filter(Boolean).join('\n')

  return { html, plainText }
}

function bannerBlock(defaultHref: string, accentColor: string, banner?: SignatureAssignment['banner']) {
  if (!banner) return ''
  const headline = safeText(banner.headline)
  const body = safeText(banner.body)
  if (!headline || !body) return ''
  const ctaLabel = safeText(banner.ctaLabel, 'Learn more')
  const ctaHref = safeUrl(banner.ctaHref, safeUrl(defaultHref))

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin-top:16px;background:#eef5fb;border:1px solid #d7e3f2;border-radius:16px;">
      <tr>
        <td style="padding:16px 18px;">
          <div style="font-size:14px;line-height:1.35;font-weight:700;color:#1f2430;">${escapeHtml(headline)}</div>
          <div style="font-size:12px;line-height:1.55;color:#526079;padding-top:6px;">${escapeHtml(body)}</div>
          <div style="padding-top:12px;">
            <a href="${ctaHref}" style="display:inline-block;padding:9px 14px;border-radius:14px;background:${accentColor};color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;line-height:1;">${escapeHtml(ctaLabel)}</a>
          </div>
        </td>
      </tr>
    </table>
  `.trim()
}
