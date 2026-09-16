// Only verified public details belong in this file.
export const profile = {
  name: 'Jingsong Wang', chineseName: '王敬淞', role: 'Graduate Student', field: 'CS / AI',
  affiliation: 'Tongji University, Shanghai',
  introduction: 'I am a graduate student at Tongji University working on the safety of multimodal large language models. My research focuses on understanding jailbreak vulnerabilities and developing defenses that preserve useful model capabilities.',
  email: 'jingsongwang@tongji.edu.cn', github: 'https://github.com/jingsong-wang', scholar: null, cv: null,
};
export const papers = [
  {
    id: 'mmjailbench', category: 'Benchmark',
    title: 'MMJailBench: A Factorized Benchmark for Disentangling Multimodal Jailbreak Vulnerabilities',
    authors: ['Tianshi Wang', 'Jingsong Wang', 'Yafei Huang', 'Fengling Li', 'Xin Li', 'Lei Zhu'],
    venue: 'arXiv preprint, 2026',
    summary: 'A controlled benchmark that disentangles harmful intent, prompt framing, visual semantics, and instruction carriers to trace the sources of multimodal jailbreak vulnerability. Evaluations across 16 models reveal distinct safety profiles and support reproducible, factor-level auditing.',
    paperUrl: 'https://arxiv.org/abs/2608.25490', pdfUrl: 'https://arxiv.org/pdf/2608.25490', codeUrl: null,
  },
  {
    id: 'defense', category: 'Defense', title: 'Multimodal safety defenses',
    authors: [], venue: 'Ongoing research',
    summary: 'I study inference-time defenses for vision-language models, aiming to reduce harmful responses while preserving useful assistance on benign requests.',
    paperUrl: null, pdfUrl: null, codeUrl: null,
  },
];
export const education = [
  { degree: 'Graduate studies', status: 'In progress', institution: 'Tongji University', school: 'School of Computer Science and Technology', location: 'Shanghai, China', dates: null },
  { degree: "Bachelor's degree", status: null, institution: 'Huazhong Agricultural University', school: 'College of Informatics', location: 'Wuhan, China', dates: null },
];
export const awards = [
  { name: 'CCF Elite Collegiate Award', detail: 'China Computer Federation' },
  { name: 'ICPC Asia Regional Contests', detail: 'Bronze medals', context: '49th Shenyang Regional / 50th Nanjing Regional' },
  { name: 'CCPC National Invitational Contests', detail: 'Silver awards', context: 'Zhengzhou / Shandong' },
  { name: '16th Lanqiao Cup National Final', detail: 'Second Prize', context: 'C/C++ Group A' },
  { name: 'Group Programming Ladder Tournament', detail: 'Second Prize', context: 'National Final' },
];
export const projects = [
  {
    name: 'FLYLAB', subtitle: 'A fruit-fly-inspired Pong experiment',
    description: 'A browser-based playground where a neural controller built from a reduced, public Drosophila visual connectome plays Pong. Explore live neural activity, compare shuffled connections and random-action baselines, switch off sensory input, or take manual control.',
    note: 'A simplified circuit with a calibrated game interface, not a full-brain simulation.',
    websiteUrl: 'https://jingsong-wang.github.io/fruit-fly/', codeUrl: 'https://github.com/jingsong-wang/fruit-fly',
  },
];
