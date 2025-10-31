import HeroSection from "@/components/hero-section";
import type { ArticlePreview } from '@/types/article-preview';

type HomeSectionProps = {
    initialPosts?: ArticlePreview[]
}

export default function HomeSection({ initialPosts = [] }: HomeSectionProps) {
    return (
        <>
            <HeroSection initialPosts={initialPosts} />
        </>
    )
}