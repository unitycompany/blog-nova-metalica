import styled from '@emotion/styled';
import PostSlug from './[slug]';

const ContainerArticle = styled.article`
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
`

export default function Post() {
  
  return (
    <>
      <ContainerArticle>
        <PostSlug />
      </ContainerArticle>
    </>
  );
}
