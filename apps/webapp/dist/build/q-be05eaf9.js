import{f as v,V as _,G as p,_ as m,p as l,d as a,k as g,l as e,m as s,K as b,c as f,n as y}from"./q-0edf180f.js";import{B as h}from"./q-eaa3d34b.js";import{F as k,p as u,S as w,L as P}from"./q-b9524d26.js";import{k as R,F as A}from"./q-688863db.js";import{T as L}from"./q-932279c7.js";import{userApplicationLoader as V,useUpdateApplicationProvidersAction as z}from"./q-63dd55fc.js";const j=()=>{const[r,o,n]=v();navigator.clipboard.writeText(`${r}/providers/${n.params.id}/${o.key}/callback`)},T=_(p(()=>m(()=>import("./q-e1f17ea9.js"),["build/q-e1f17ea9.js","build/q-0edf180f.js"]),"s_f7XVgnW1AQ4")),B=()=>{const r=R(),o=V(),n=z();return l(y,{value:o,onPending:()=>a("div",null,{class:"flex h-full w-full items-center justify-center"},l(P,null,3,"10_0"),1,"10_1"),onRejected:()=>l(k,null,3,"10_2"),onResolved:({application:i,baseUrl:c})=>l(g,{children:[l(L,null,3,"10_3"),a("div",null,{class:"mx-auto max-w-7xl lg:px-8 sm:px-8 mt-12 container mx-auto max-w-4xl"},[a("h2",null,{class:"flex text-2xl font-semibold text-zinc-900 dark:text-zinc-100"},"Auth Providers",3,null),a("p",null,{class:"mt-2 text-sm text-zinc-600 dark:text-zinc-400"},"Authenticate your users through a suite of providers and login methods.",3,null),l(A,{action:n,spaReset:!0,class:"mt-6",children:u.map((t,d)=>l(T,{isLast:u.length-1===d,isFirst:d===0,enabled:i[`${t.key}_provider_enabled`],get label(){return t.label},get inactive(){return t.inactive},children:[l(w,{get schema(){return t.data},defaultValues:i,[e]:{schema:s(t,"data")}},3,"10_4"),(t==null?void 0:t.canCopy)&&a("div",null,{class:"flex items-center mt-8 bg-gray-100 w-max max-w-max rounded-md"},[a("span",null,{class:"text-xs font-medium text-gray-900 mx-4"},[c,"/providers/",b(x=>x.params.id,[r]),"/",f(t,"key"),"/callback"],1,null),a("button",{onClick$:p(()=>m(()=>Promise.resolve().then(()=>E),void 0),"s_BcPddrR9NWE",[c,t,r])},{"data-tooltip-target":"default-radio-example-copy-clipboard-tooltip","data-tooltip-placement":"bottom",type:"button","data-copy-state":"copy",class:"flex items-center px-3 py-3 text-xs font-medium text-gray-600 bg-gray-100 border-l rounded-r-md border-gray-200 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-800 hover:text-blue-700 dark:hover:text-white copy-to-clipboard-button"},[a("svg",null,{class:"w-4 h-4 mr-2",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},a("path",null,{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"},null,3,null),3,null),a("span",null,{class:"copy-text"},"Copy",3,null)],2,null)],1,"10_5"),a("div",null,{class:"flex pt-2 justify-between items-center mt-8"},[a("p",null,{class:"text-sm font-medium text-zinc-800 dark:text-zinc-200"},"Learn more",3,null),l(h,{label:"Save",isRunning:!1,type:"submit",[e]:{label:e,isRunning:e,type:e}},3,"10_6")],1,null)],[e]:{label:s(t,"label"),inactive:s(t,"inactive")}},1,t.key)),[e]:{action:e,spaReset:e,class:e}},1,"10_7")],1,null)]},1,"10_8"),[e]:{value:e,onPending:e,onRejected:e,onResolved:e}},3,"10_9")},E=Object.freeze(Object.defineProperty({__proto__:null,s_BcPddrR9NWE:j,s_RQg8ubKKGZc:B},Symbol.toStringTag,{value:"Module"}));export{j as s_BcPddrR9NWE,B as s_RQg8ubKKGZc};
