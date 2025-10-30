import { categories } from '@/content/categories'
import styled from '@emotion/styled'
import Badge from '../badge'
import { type Dispatch, type SetStateAction } from 'react'
import { media } from '../../styles/media'
import Carousel from '../carousel/carousel'
import { SwiperSlide } from 'swiper/react'
import type { ArticlePreview } from '@/types/article-preview'

const ListCategory = styled.ol`
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    gap: 12px;
    position: relative;
    z-index: 4;

    ${media('mobile')}{
        width: calc(100% - 10%);
        align-items: flex-start;
        justify-content: flex-start;

        /* &::before {
            content: '';
            position: absolute;
            top: 0;
            height: 100%;
            width: 60px;
            right: 1px;
            z-index: 3;
            pointer-events: none;
            background: linear-gradient(-90deg, ${(props) => props.theme.color.primary}, transparent);
        } */
    }
`

interface CategoryProps {
    categoryActive: string
    setCategoryActive?: Dispatch<SetStateAction<string>>
    posts: ArticlePreview[]
}

export default function Category({ categoryActive, setCategoryActive, posts }: CategoryProps) {
    const categoriesData = categories

    return (
        <ListCategory>
            <Carousel>
                <SwiperSlide>
                    <Badge
                        className={categoryActive === 'Todos' ? 'active' : ''}
                        quantity={posts.length}
                        onClick={() => setCategoryActive?.('Todos')}
                    >
                        Todos
                    </Badge>
                </SwiperSlide>
                        {categoriesData.map((category) => {
                    const quantity = posts.filter((post) => post.categorySlug === category.slug).length
                    return (
                                <SwiperSlide key={category.slug}>
                            <Badge
                                className={categoryActive === category.slug ? 'active' : ''}
                                quantity={quantity}
                                onClick={() => setCategoryActive?.(category.slug)}
                            >
                                {category.title}
                            </Badge>
                        </SwiperSlide>
                    )
                })}
            </Carousel>
        </ListCategory>
    )
}