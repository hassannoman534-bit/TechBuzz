import sharp from "sharp";
import { readdirSync } from "fs";
import path from "path";
const dir = "public/assets/logos";
const files = readdirSync(dir).filter(f=>/\.(png|jpe?g|webp|svg)$/i.test(f) && !/-clean\.png$/i.test(f));
for (const f of files) {
  const p = path.join(dir, f);
  try {
    const img = sharp(p);
    const m = await img.metadata();
    let bg = "n/a";
    if (/\.svg$/i.test(f)) { console.log(JSON.stringify({ f, w:m.width, h:m.height, type:"svg" })); continue; }
    // sample 4 corners + check overall alpha coverage
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject:true });
    const ch = info.channels; const W=info.width, H=info.height;
    const px=(x,y)=>{const i=(y*W+x)*ch; return [data[i],data[i+1],data[i+2],data[i+3]];};
    const corners=[px(0,0),px(W-1,0),px(0,H-1),px(W-1,H-1)];
    const cornerAlpha = corners.map(c=>c[3]);
    const transparentCorners = cornerAlpha.filter(a=>a<16).length;
    // count fully-transparent pixels ratio (sample grid)
    let trans=0, tot=0, nearWhiteOpaque=0;
    for(let y=0;y<H;y+=Math.max(1,(H/80|0))) for(let x=0;x<W;x+=Math.max(1,(W/80|0))){ const [r,g,b,a]=px(x,y); tot++; if(a<16) trans++; else if(r>240&&g>240&&b>240) nearWhiteOpaque++; }
    const transRatio=(trans/tot*100).toFixed(0), whiteRatio=(nearWhiteOpaque/tot*100).toFixed(0);
    console.log(JSON.stringify({ f, w:m.width, h:m.height, hasAlpha:m.hasAlpha, transparentCorners, transPct:+transRatio, whiteOpaquePct:+whiteRatio }));
  } catch(e){ console.log(JSON.stringify({ f, error:e.message })); }
}
