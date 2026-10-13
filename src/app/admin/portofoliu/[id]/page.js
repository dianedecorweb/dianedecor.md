import { notFound, redirect } from 'next/navigation'

import ProjectForm from '@/components/admin/ProjectForm'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Container from '@/components/layout/Container'
import { canEditContent, getAdminCategories, getAdminProject } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'
import { toIsoDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Editare proiect',
  robots: { index: false, follow: false },
}

export default async function EditProjectPage({ params }) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) redirect('/admin/login')

  const { id } = await params
  const [project, categories] = await Promise.all([getAdminProject(id), getAdminCategories()])

  if (!project) notFound()

  // <input type="date"> needs a bare YYYY-MM-DD, and the form wants no nulls.
  const initial = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    categorySlug: project.categorySlug,
    clientNames: project.clientNames ?? '',
    location: project.location ?? '',
    eventDate: project.eventDate ? toIsoDate(project.eventDate).slice(0, 10) : '',
    shortDescription: project.shortDescription,
    description: project.description,
    coverImage: project.coverImage,
    beforeImage: project.beforeImage ?? '',
    images: project.images?.length ? project.images : [''],
    featured: project.featured,
    published: project.published,
    order: project.order ?? 0,
  }

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <Breadcrumbs
        items={[
          { label: 'Portofoliu', href: '/admin/portofoliu' },
          { label: project.title, href: `/admin/portofoliu/${id}` },
        ]}
      />

      <h1 className="mt-6 text-4xl">{project.title}</h1>

      <div className="mt-10 max-w-4xl">
        <ProjectForm project={initial} categories={categories} readOnly={!canEditContent()} />
      </div>
    </Container>
  )
}
