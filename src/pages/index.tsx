import HomeSection from "@/components/templates/home";
import styled from '@emotion/styled';

const ContainerHome = styled.article`
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
`

export default function Home() {
  
  return (
    <>
      <ContainerHome>
        <HomeSection />
      </ContainerHome>
    </>
  );
}
