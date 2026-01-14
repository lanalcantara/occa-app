export type Question = {
    id: number;
    text: string;
    options: {
        label: string;
        value: "D" | "I" | "S" | "C";
    }[];
};

export const discQuestions: Question[] = [
    {
        id: 1,
        text: "Como você se descreve em um grupo?",
        options: [
            { label: "Assertivo e direto, gosto de liderar.", value: "D" },
            { label: "Comunicativo e entusiasmado, gosto de interagir.", value: "I" },
            { label: "Calmo e paciente, gosto de apoiar.", value: "S" },
            { label: "Analítico e detalhista, gosto de planejar.", value: "C" },
        ],
    },
    {
        id: 2,
        text: "O que mais te motiva?",
        options: [
            { label: "Resultados e desafios.", value: "D" },
            { label: "Reconhecimento e conexões sociais.", value: "I" },
            { label: "Estabilidade e harmonia.", value: "S" },
            { label: "Precisão e qualidade.", value: "C" },
        ],
    },
    {
        id: 3,
        text: "Como você lida com mudanças?",
        options: [
            { label: "Aceito rápido se trouxer resultados.", value: "D" },
            { label: "Gosto, desde que seja divertido e inovador.", value: "I" },
            { label: "Prefiro manter a rotina, mudanças me preocupam.", value: "S" },
            { label: "Analiso os riscos antes de aceitar.", value: "C" },
        ],
    },
    {
        id: 4,
        text: "Diante de um conflito, você:",
        options: [
            { label: "Enfrenta logo para resolver.", value: "D" },
            { label: "Tenta persuadir e influenciar.", value: "I" },
            { label: "Cede para manter a paz.", value: "S" },
            { label: "Usa lógica e regras para argumentar.", value: "C" },
        ]
    }
];
