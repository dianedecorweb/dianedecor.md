import Link from 'next/link'

/** A contact channel as a link: client-side for our own pages, a new tab for Instagram. */
export default function ChannelLink({ channel, className, onClick, children }) {
  if (channel.internal) {
    return (
      <Link href={channel.href} onClick={onClick} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <a
      href={channel.href}
      onClick={onClick}
      className={className}
      {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}
