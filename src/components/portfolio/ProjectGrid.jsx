import ProjectCard from '@/components/portfolio/ProjectCard'

/**
 * `priorityCount` is 1 on purpose. The grid is a single column on phones, so
 * only the first cover is above the fold there — and phones are where most of
 * this traffic lands. Preloading three covers made the other two compete for
 * bandwidth with the LCP image, which costs real time once these are actual
 * photographs rather than flat placeholders.
 *
 * Următoarele trei coperți pornesc devreme, dar fără `priority`: nu primesc
 * legătură de preîncărcare, deci nu concurează cu imaginea principală, însă nu
 * mai așteaptă scroll-ul. Pe telefon, unde grila e o singură coloană, ele sunt
 * exact cele care apăreau cu întârziere.
 */
const EAGER_COUNT = 4

export default function ProjectGrid({ projects, priorityCount = 1 }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {projects.map((project, index) => (
        <li key={project.slug}>
          <ProjectCard
            project={project}
            priority={index < priorityCount}
            eager={index < EAGER_COUNT}
          />
        </li>
      ))}
    </ul>
  )
}
