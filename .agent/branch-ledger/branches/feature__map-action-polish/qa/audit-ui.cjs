const fs=require('fs'),path=require('path'),vm=require('vm');
const base=path.resolve('frontend/src');
const {parse:parseSfc}=require(path.resolve('frontend/node_modules/@vue/compiler-sfc'));
const {parse:baseParse}=require(path.resolve('frontend/node_modules/@vue/compiler-dom'));
const text=fs.readFileSync(path.join(base,'i18n/ui-localizer.ts'),'utf8');
const manual=vm.runInNewContext('('+text.match(/const manualTranslations[^=]*= (\{[\s\S]*?\n\})/)[1]+')');
const file=fs.readFileSync(path.join(base,'i18n/ui-translations.en.ts'),'utf8');
const map={...JSON.parse(file.slice(file.indexOf('{'))),...manual};
const missing=new Map();
function walkNodes(n,filename,protected=false){
 protected ||= n.type===1 && n.props.some(p=>p.name==='data-no-translate');
 if(protected)return;
 if(n.type===2)check(n.content,filename);
 if(n.type===1)for(const p of n.props)if(p.type===6&&['title','aria-label','placeholder'].includes(p.name)&&p.value)check(p.value.content,filename);
 for(const child of n.children||[])walkNodes(child,filename,protected);
}
function check(s,f){s=s.trim().replace(/\s+/g,' ');if(/[가-힣]/.test(s)&&!map[s])missing.set(s,(missing.get(s)||[]).concat(f));}
function scan(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){let p=path.join(dir,f.name);if(f.isDirectory())scan(p);else if(p.endsWith('.vue')){const {descriptor}=parseSfc(fs.readFileSync(p,'utf8'));if(descriptor.template)walkNodes(baseParse(descriptor.template.content),path.relative(base,p));}}}
scan(path.join(base,'pages'));scan(path.join(base,'components'));
fs.writeFileSync(path.join(__dirname,'missing-ui.json'),JSON.stringify([...missing],null,2));
console.log([...missing.keys()].join('\n'));console.log('Missing:',missing.size);

