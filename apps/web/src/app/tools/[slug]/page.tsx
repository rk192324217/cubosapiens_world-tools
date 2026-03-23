import { fetchTool, fetchTools } from "@/lib/api"
import { notFound }              from "next/navigation"
import ToolPageClient            from "@/components/ui/ToolPageClient"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ToolPage({ params }: Props)
{
  const { slug } = await params

  const [tool, allTools] = await Promise.all([
    fetchTool(slug),
    fetchTools()
  ])

  if(!tool) notFound()

  const recommended = allTools
    .filter(t => t.slug !== slug)
    .sort((a, b) => {
      if(a.category === tool.category && b.category !== tool.category) return -1
      if(b.category === tool.category && a.category !== tool.category) return 1
      return 0
    })
    .slice(0, 6)

  return <ToolPageClient tool={tool} recommended={recommended} />
}