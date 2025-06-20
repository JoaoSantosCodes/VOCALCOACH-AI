export interface VocalExercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'iniciante' | 'intermediário' | 'avançado';
  duration: number; // em segundos
  type: 'aquecimento' | 'técnica' | 'respiração' | 'afinação';
  steps: {
    id: string;
    instruction: string;
    duration: number;
    targetNote?: string;
    targetPitch?: number;
    animation?: string;
  }[];
  tips: string[];
  benefits: string[];
}

export const vocalExercises: VocalExercise[] = [
  {
    id: 'warmup-1',
    title: 'Aquecimento Básico',
    description: 'Um exercício simples para aquecer sua voz antes de cantar',
    difficulty: 'iniciante',
    duration: 300, // 5 minutos
    type: 'aquecimento',
    steps: [
      {
        id: 'warmup-1-1',
        instruction: 'Respire profundamente pelo diafragma por 4 segundos',
        duration: 4,
        animation: 'breathing'
      },
      {
        id: 'warmup-1-2',
        instruction: 'Segure o ar por 4 segundos',
        duration: 4,
        animation: 'hold'
      },
      {
        id: 'warmup-1-3',
        instruction: 'Solte o ar fazendo um som de "SSS" por 4 segundos',
        duration: 4,
        animation: 'release'
      }
    ],
    tips: [
      'Mantenha os ombros relaxados',
      'Foque na expansão do diafragma',
      'Não force a garganta'
    ],
    benefits: [
      'Aquece as cordas vocais',
      'Melhora o controle respiratório',
      'Prepara a voz para o canto'
    ]
  },
  {
    id: 'pitch-control-1',
    title: 'Controle de Afinação',
    description: 'Exercício para melhorar sua afinação e controle de pitch',
    difficulty: 'intermediário',
    duration: 420, // 7 minutos
    type: 'afinação',
    steps: [
      {
        id: 'pitch-1-1',
        instruction: 'Cante a nota Dó central e mantenha por 4 segundos',
        duration: 4,
        targetNote: 'C4',
        targetPitch: 261.63 // Frequência do Dó central
      },
      {
        id: 'pitch-1-2',
        instruction: 'Suba meio tom para Dó# e mantenha por 4 segundos',
        duration: 4,
        targetNote: 'C#4',
        targetPitch: 277.18
      },
      {
        id: 'pitch-1-3',
        instruction: 'Continue subindo até completar uma oitava',
        duration: 4,
        targetNote: 'C5',
        targetPitch: 523.25
      }
    ],
    tips: [
      'Use um afinador para referência',
      'Mantenha a postura ereta',
      'Respire entre as notas'
    ],
    benefits: [
      'Melhora a afinação',
      'Desenvolve a percepção musical',
      'Aumenta o controle vocal'
    ]
  },
  {
    id: 'breathing-1',
    title: 'Respiração Diafragmática',
    description: 'Aprenda a respirar corretamente para o canto',
    difficulty: 'iniciante',
    duration: 360, // 6 minutos
    type: 'respiração',
    steps: [
      {
        id: 'breathing-1-1',
        instruction: 'Deite-se e coloque uma mão sobre o abdômen',
        duration: 10,
        animation: 'lying'
      },
      {
        id: 'breathing-1-2',
        instruction: 'Inspire expandindo o abdômen por 4 segundos',
        duration: 4,
        animation: 'inhale'
      },
      {
        id: 'breathing-1-3',
        instruction: 'Expire lentamente por 6 segundos',
        duration: 6,
        animation: 'exhale'
      }
    ],
    tips: [
      'O abdômen deve subir ao inspirar',
      'Mantenha os ombros parados',
      'Expire todo o ar antes de inspirar novamente'
    ],
    benefits: [
      'Melhora a capacidade pulmonar',
      'Aumenta o controle do fluxo de ar',
      'Reduz a tensão na garganta'
    ]
  }
]; 