import{f as C,dP as i,r,j as o,dT as n,L as v,as as w,be as j,c as d,dp as s}from"./index-De4aIeDi-1771564560545.js";const T=()=>{C();const[a]=i.useForm(),[b,c]=r.useState(""),[f,g]=r.useState(!0),[m,u]=r.useState(!1),[h,q]=r.useState(null),p=r.useMemo(()=>({toolbar:[[{header:[1,2,3,4,5,6,!1]}],[{font:[]}],[{size:[]}],["bold","italic","underline","strike","blockquote"],[{list:"ordered"},{list:"bullet"},{indent:"-1"},{indent:"+1"}],["link","image","video"],[{align:[]}],[{color:[]},{background:[]}],["clean"]],clipboard:{matchVisual:!1}}),[]),x=["header","font","size","bold","italic","underline","strike","blockquote","list","bullet","indent","link","image","video","align","color","background"];r.useEffect(()=>{(async()=>{try{const e=await d.get("/api/terms");if(e.data.length>0){const l=e.data[0];c(l.termsCondition),q(l._id),a.setFieldsValue({termsCondition:l.termsCondition}),u(!0)}}catch{s.error("Failed to fetch terms and conditions data")}finally{g(!1)}})()},[a]);const k=t=>{c(t),a.setFieldsValue({termsCondition:t})},y=async()=>{try{const t={termsCondition:b};m?(await d.put(`/api/terms/${h}`,t),s.success("Terms and conditions updated successfully")):(await d.post("/api/terms/add",t),s.success("Terms and conditions created successfully"))}catch(t){s.error("Failed to save terms and conditions"),console.error("Error:",t)}};return f?o.jsx("p",{children:"Loading..."}):o.jsxs(o.Fragment,{children:[o.jsxs(n,{className:"mb-4",children:[o.jsx(n.Item,{children:o.jsx(v,{to:"/dashboard",children:"Dashboard"})}),o.jsx(n.Item,{children:"Terms and Conditions Form"})]}),o.jsxs(i,{form:a,layout:"vertical",onFinish:y,children:[o.jsx(i.Item,{name:"termsCondition",label:"Terms and Conditions",rules:[{required:!0,message:"Please enter the terms and conditions"},{validator:(t,e)=>{const l=e==null?void 0:e.replace(/<[^>]*>/g,"").trim();return!l||l===""?Promise.reject("Please enter the terms and conditions"):Promise.resolve()}}],children:o.jsx(w,{theme:"snow",value:b,onChange:k,modules:p,formats:x,placeholder:"Start typing your terms and conditions...",style:{height:"400px",marginBottom:"50px"}})}),o.jsx(i.Item,{children:o.jsx(j,{type:"primary",htmlType:"submit",children:m?"Update":"Save"})})]}),o.jsx("style",{jsx:!0,children:`
        /* Quill Editor Customization */
        :global(.ql-container) {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 16px;
        }

        :global(.ql-toolbar) {
          background-color: #fafafa;
          border: 1px solid #d9d9d9;
          border-bottom: none;
          border-radius: 6px 6px 0 0;
        }

        :global(.ql-container.ql-snow) {
          border: 1px solid #d9d9d9;
          border-radius: 0 0 6px 6px;
        }

        :global(.ql-editor) {
          min-height: 400px;
          font-size: 16px;
          line-height: 1.6;
        }

        :global(.ql-editor.ql-blank::before) {
          color: #bfbfbf;
          font-style: normal;
        }

        /* Toolbar button hover effects */
        :global(.ql-toolbar button:hover),
        :global(.ql-toolbar button:focus) {
          color: #1890ff;
        }

        :global(.ql-toolbar button.ql-active) {
          color: #1890ff;
        }

        :global(.ql-toolbar .ql-stroke) {
          stroke: #595959;
        }

        :global(.ql-toolbar button:hover .ql-stroke),
        :global(.ql-toolbar button:focus .ql-stroke),
        :global(.ql-toolbar button.ql-active .ql-stroke) {
          stroke: #1890ff;
        }

        :global(.ql-toolbar .ql-fill) {
          fill: #595959;
        }

        :global(.ql-toolbar button:hover .ql-fill),
        :global(.ql-toolbar button:focus .ql-fill),
        :global(.ql-toolbar button.ql-active .ql-fill) {
          fill: #1890ff;
        }

        /* Picker hover effects */
        :global(.ql-toolbar .ql-picker-label:hover),
        :global(.ql-toolbar .ql-picker-item:hover) {
          color: #1890ff;
        }

        /* Editor content styling */
        :global(.ql-editor h1) {
          font-size: 2em;
          font-weight: 700;
          margin-bottom: 0.5em;
        }

        :global(.ql-editor h2) {
          font-size: 1.5em;
          font-weight: 600;
          margin-bottom: 0.5em;
        }

        :global(.ql-editor h3) {
          font-size: 1.25em;
          font-weight: 600;
          margin-bottom: 0.5em;
        }

        :global(.ql-editor p) {
          margin-bottom: 1em;
        }

        :global(.ql-editor ul),
        :global(.ql-editor ol) {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }

        :global(.ql-editor blockquote) {
          border-left: 4px solid #1890ff;
          padding-left: 16px;
          margin: 1em 0;
          font-style: italic;
          color: #595959;
        }

        :global(.ql-editor a) {
          color: #1890ff;
          text-decoration: underline;
        }

        :global(.ql-editor a:hover) {
          color: #40a9ff;
        }

        :global(.ql-editor img) {
          max-width: 100%;
          height: auto;
        }

        /* Focus state */
        :global(.ql-container.ql-snow:focus-within) {
          border-color: #40a9ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
        }

        /* Scrollbar styling */
        :global(.ql-editor::-webkit-scrollbar) {
          width: 8px;
        }

        :global(.ql-editor::-webkit-scrollbar-track) {
          background: #f1f1f1;
        }

        :global(.ql-editor::-webkit-scrollbar-thumb) {
          background: #d9d9d9;
          border-radius: 4px;
        }

        :global(.ql-editor::-webkit-scrollbar-thumb:hover) {
          background: #bfbfbf;
        }
      `})]})};export{T as default};
