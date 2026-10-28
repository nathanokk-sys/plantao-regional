#!/bin/sh
cd "$(dirname "$0")"
cat a2_head.html b2_body.html c_data.js c_data2.js c_data3.js d_cases1.js e_cases2.js l_cases3.js p_cases4.js c_data4.js c_data5.js c_data6.js s_part10.js v2_data.js v2_dif.js f_sprite.js g_engine.js m_extra.js k_proc.js n_save.js r_labs.js q_week.js t_part10.js v2_mech.js j_music.js v2_ui.js v2_ui2.js z_end.html | sed "s/'pr_/'pr2_/g" > plantao-regional-v2.html
mkdir -p site
python3 - <<'P'
s=open('plantao-regional-v2.html').read();h=open('../regional/site/index.html').read()
i=h.index('<title>');j=s.index('<title>')
open('site/index.html','w').write(h[:i]+s[j:])
P
