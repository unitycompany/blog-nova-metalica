export type Category = {
    slug: string;
    title: string;
    description: string;
    ogImage: string;
    order: number;
    synonyms: string[];
    aiHint: string[];
    parent: string | null;
    index: boolean;
}

export const categories: Readonly<Category[]> = [
    {
        slug: "drywall",
        title: "Drywall",
        description: "Tudo sobre drywall, desde a instalação até dicas de manutenção.",
        ogImage: "",
        order: 1,
        synonyms: ["gesso acartonado", "parede de gesso"],
        aiHint: ["drywall installation", "drywall maintenance", "drywall tips"],
        parent: null,
        index: true,
    },
    {
        slug: "steel-frame",
        title: "Steel Frame",
        description: "Tudo sobre steel frame, desde a instalação até dicas de manutenção.",
        ogImage: "",
        order: 2,
        synonyms: ["gesso acartonado", "parede de gesso"],
        aiHint: ["drywall installation", "drywall maintenance", "drywall tips"],
        parent: null,
        index: true,
    },
    {
        slug: "acustica",
        title: "Acústica",
        description: "Tudo sobre drywall, desde a instalação até dicas de manutenção.",
        ogImage: "",
        order: 3,
        synonyms: ["gesso acartonado", "parede de gesso"],
        aiHint: ["drywall installation", "drywall maintenance", "drywall tips"],
        parent: null,
        index: true,
    },
    {
        slug: "forros",
        title: "Forros",
        description: "Tudo sobre drywall, desde a instalação até dicas de manutenção.",
        ogImage: "",
        order: 4,
        synonyms: ["gesso acartonado", "parede de gesso"],
        aiHint: ["drywall installation", "drywall maintenance", "drywall tips"],
        parent: null,
        index: true,
    },
    {
        slug: "casas-modulares",
        title: "Casas Modulares",
        description: "Tudo sobre drywall, desde a instalação até dicas de manutenção.",
        ogImage: "",
        order: 5,
        synonyms: ["gesso acartonado", "parede de gesso"],
        aiHint: ["drywall installation", "drywall maintenance", "drywall tips"],
        parent: null,
        index: true,
    }
] as const;

export const categorySlugs = categories.map(c => c.slug) as readonly string[]; 