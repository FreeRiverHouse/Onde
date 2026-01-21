var o={},I=(b,k,w)=>(o.__chunk_3326=(H,c,d)=>{"use strict";d.d(c,{$:()=>y,BL:()=>A,FF:()=>u,Pw:()=>D,Rr:()=>N,VC:()=>f,Xw:()=>S,YA:()=>p,_R:()=>l,d_:()=>i,n5:()=>E,rL:()=>m,w7:()=>_,xT:()=>g,zd:()=>h,zf:()=>T});let u=["post_feedback","post_edit","post_create","post_approve","post_schedule","book_edit","book_create","book_review","book_translate","image_generate","image_edit","image_upscale","content_create","content_review","content_translate","code_review","code_fix","code_deploy","code_test","qa_test","qa_report","qa_validate","automation_run","automation_schedule","automation_monitor","agent_message","agent_request","agent_response"],l=["post","book","image","code","test","deployment","message","general"],p=["low","normal","high","urgent"],_=["onde.surf","freeriverflow","telegram","cli"];async function g(r,a={}){try{let e="SELECT * FROM agent_tasks WHERE 1=1",t=[];if(a.status)if(Array.isArray(a.status)){let n=a.status.map(()=>"?").join(", ");e+=` AND status IN (${n})`,t.push(...a.status)}else e+=" AND status = ?",t.push(a.status);a.assigned_to&&(e+=" AND assigned_to = ?",t.push(a.assigned_to)),a.type&&(e+=" AND type = ?",t.push(a.type)),a.priority&&(e+=" AND priority = ?",t.push(a.priority)),e+=` ORDER BY
      CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
      END,
      created_at DESC`,a.limit?(e+=" LIMIT ?",t.push(a.limit)):e+=" LIMIT 100";let s=r.prepare(e);return t.length>0&&(s=s.bind(...t)),(await s.all()).results}catch(e){return console.error("D1 getAgentTasks error:",e),[]}}async function i(r,a){try{return await r.prepare("SELECT * FROM agent_tasks WHERE id = ?").bind(a).first()}catch(e){return console.error("D1 getAgentTaskById error:",e),null}}async function E(r,a){try{let e={...a,id:`task_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,status:a.status||"pending",created_at:new Date().toISOString()};await r.prepare(`INSERT INTO agent_tasks (
        id, type, target_id, target_type, description, payload, status,
        assigned_to, source_agent, source_dashboard, priority, created_by,
        created_at, due_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(e.id,e.type,e.target_id||null,e.target_type||null,e.description,e.payload||null,e.status,e.assigned_to||null,e.source_agent||null,e.source_dashboard||null,e.priority||"normal",e.created_by||"dashboard",e.created_at,e.due_at||null,e.metadata||null).run();try{await r.prepare("INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)").bind(0,"task_created",JSON.stringify({task_id:e.id,task_type:e.type,description:e.description.substring(0,100),priority:e.priority,source_dashboard:e.source_dashboard})).run()}catch(t){console.warn("Failed to log activity:",t)}return e}catch(e){return console.error("D1 createAgentTask error:",e),null}}async function y(r,a,e){try{let t=await r.prepare(`UPDATE agent_tasks
       SET status = 'claimed', assigned_to = ?, claimed_at = ?
       WHERE id = ? AND status = 'pending'`).bind(e,new Date().toISOString(),a).run();if(t.success)try{await r.prepare("INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)").bind(0,"task_claimed",JSON.stringify({task_id:a,agent:e})).run()}catch{}return t.success}catch(t){return console.error("D1 claimAgentTask error:",t),!1}}async function N(r,a){try{return(await r.prepare(`UPDATE agent_tasks
       SET status = 'in_progress'
       WHERE id = ? AND status = 'claimed'`).bind(a).run()).success}catch(e){return console.error("D1 startAgentTask error:",e),!1}}async function S(r,a,e){try{let t=await i(r,a),s=await r.prepare(`UPDATE agent_tasks
       SET status = 'done', completed_at = ?, result = ?
       WHERE id = ? AND status IN ('claimed', 'in_progress')`).bind(new Date().toISOString(),e,a).run();if(s.success&&t)try{await r.prepare("INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)").bind(0,"task_completed",JSON.stringify({task_id:a,task_type:t.type,agent:t.assigned_to})).run()}catch{}return s.success}catch(t){return console.error("D1 completeAgentTask error:",t),!1}}async function T(r,a,e){try{let t=await i(r,a),s=await r.prepare(`UPDATE agent_tasks
       SET status = 'failed', completed_at = ?, error = ?
       WHERE id = ? AND status IN ('pending', 'claimed', 'in_progress')`).bind(new Date().toISOString(),e,a).run();if(s.success&&t)try{await r.prepare("INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)").bind(0,"task_failed",JSON.stringify({task_id:a,type:t.type,error:e,assigned_to:t.assigned_to})).run()}catch{}return s.success}catch(t){return console.error("D1 failAgentTask error:",t),!1}}async function D(r){try{return await r.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status IN ('claimed', 'in_progress') THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM agent_tasks
    `).first()||{total:0,pending:0,in_progress:0,done:0,failed:0}}catch(a){return console.error("D1 getAgentTaskStats error:",a),{total:0,pending:0,in_progress:0,done:0,failed:0}}}async function A(r,a,e){try{let t=`
      SELECT * FROM agent_tasks
      WHERE status = 'pending'
    `,s=[];e&&(t+=" AND type = ?",s.push(e)),t+=`
      ORDER BY
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'normal' THEN 3
          WHEN 'low' THEN 4
        END,
        created_at ASC
      LIMIT 1
    `;let n=r.prepare(t);return s.length>0&&(n=n.bind(...s)),await n.first()}catch(t){return console.error("D1 getNextAvailableTask error:",t),null}}async function m(r){try{return(await r.prepare("SELECT * FROM agents ORDER BY name").all()).results}catch(a){return console.error("D1 getAgents error:",a),[]}}async function h(r,a){try{return(await r.prepare("UPDATE agents SET last_seen = ?, status = ? WHERE id = ?").bind(new Date().toISOString(),"active",a).run()).success}catch(e){return console.error("D1 updateAgentHeartbeat error:",e),!1}}async function f(r,a){try{let e=new Date().toISOString(),t={...a,created_at:a.created_at||e,last_seen:e};return await r.prepare(`INSERT INTO agents (id, name, type, description, capabilities, status, last_seen, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         type = excluded.type,
         description = excluded.description,
         capabilities = excluded.capabilities,
         status = excluded.status,
         last_seen = excluded.last_seen`).bind(t.id,t.name,t.type,t.description||null,t.capabilities||null,t.status||"active",t.last_seen,t.created_at).run(),t}catch(e){return console.error("D1 registerAgent error:",e),null}}},o);export{I as __getNamedExports};
