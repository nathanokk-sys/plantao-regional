# Plantão Regional

Jogo de plantão de Clínica Médica num hospital regional do SUS, em pixel art inspirado em *Papers, Please*.

**Jogar:** https://nathanokk-sys.github.io/plantao-regional

- Pacientes com 16 anos ou mais, sorteados a cada plantão (nome, rosto, idade, cidade, sinais vitais e alergias)
- Anamnese, exame físico por sistemas, exames, prescrição com dose, via, frequência e duração
- Medidas iniciais (MOV), destino, recados dos setores e devolução de encaminhamentos errados
- Trilha sonora adaptativa e relatório de passagem de plantão
- Roda inteiro no navegador, sem servidor e sem login

Simulação educacional com casos fictícios. Doses e condutas simplificadas a partir de diretrizes brasileiras e da RENAME; não substituem protocolos institucionais nem a supervisão do preceptor.

## Estrutura

`index.html` é o jogo completo em um arquivo. A pasta `src/` guarda as partes separadas: dados clínicos (`c_data*.js`), casos (`d_cases1.js`, `e_cases2.js`, `l_cases3.js`), pixel art (`f_sprite.js`), motor (`g_engine.js`, `m_extra.js`, `k_proc.js`), interface (`h_ui.js`) e música (`j_music.js`).
