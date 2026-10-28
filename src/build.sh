#!/bin/sh
cd "$(dirname "$0")"
cat a_head.html b_body.html c_data.js c_data2.js c_data3.js d_cases1.js e_cases2.js l_cases3.js p_cases4.js c_data4.js c_data5.js c_data6.js s_part10.js f_sprite.js g_engine.js m_extra.js k_proc.js n_save.js r_labs.js q_week.js t_part10.js h_ui.js j_music.js z_end.html > plantao-regional.html
python3 - <<'P'
s=open('plantao-regional.html').read();h=open('site/index.html').read()
i=h.index('<title>');j=s.index('<title>')
open('site/index.html','w').write(h[:i]+s[j:])
P
