import styled from '@emotion/styled';
import Icon from '../ui/icon';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr';
import { rgba } from 'polished';
import { useState } from 'react';
import {media} from '../../styles/media';

const SearchContainer = styled.div`
    width: 100%;
    max-width: 600px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: auto;
    padding: 6px 6px 6px 22px;
    position: relative;
    z-index: 2;
    gap: 16px;
    background-color: ${(props) => rgba(props.theme.color.primary.dark, 0.1)};
    border-radius: 42px;
    box-shadow: ${(props) => props.theme.lines.left} ${(props) => props.theme.color.gray[300]}, 
                ${(props) => props.theme.lines.right} ${(props) => props.theme.color.gray[300]},
                ${(props) => props.theme.lines.top} ${(props) => props.theme.color.gray[300]},
                ${(props) => props.theme.lines.bottom} ${(props) => props.theme.color.gray[300]};

    ${media('mobile')}{
        padding: 6px 6px 6px 16px;
        width: 90%;
    }

    & input {
        width: 80%;
        height: 100%;
        color: ${(props) => props.theme.color.gray[500]};
        font-size: ${(props) => props.theme.font.size.md};
        line-height: 1;

        &::placeholder {
            font-size: ${(props) => props.theme.font.size.sm};
            color: ${(props) => props.theme.color.gray[100]};
            font-weight: ${(props) => props.theme.font.weight.light};

            ${media('mobile')}{
                font-size: ${(props) => props.theme.font.size.extra_sm};
            }
        } 

        &:focus {
            outline: none;
        }
    }

    & .search-icon {
        padding: 8px;
        width: 36px;
        height: 36px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid ${(props) => rgba(props.theme.color.gray[500], 0.6)};
        border-radius: 42px;

        ${media('mobile')}{
            width: 36px;
            height: 36px;
        }
    }
`

interface SearchProps {
    onSearch?: (query: string) => void;
}

export default function Search({
    onSearch
}: SearchProps) {

    const [query, setQuery] = useState('')

    const submit = () => {
        onSearch?.(query.trim());
    }

    return (
        <SearchContainer>
            <input 
                type="text" 
                placeholder="Pesquise um artigo especifico..."
                id='input-search' 
                value={query}
                onChange={(e) => {
                    const value = e.target.value;
                    setQuery(value);
                    onSearch?.(value);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            />
            <Icon 
                className='search-icon'
                Icon={MagnifyingGlassIcon}
                size={36}
                color='#fff'
                onClick={submit}
            />
        </SearchContainer>
    )
}

Search.displayName = 'Search'