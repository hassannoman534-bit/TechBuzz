import sharp from "sharp";
const OUT = process.env.OUT;
const names = ["client-17.png","client-18.png","client-19.png","YK.png","Stronger Forverer.png","Window Price Online.png","Ertex Cart LLC.png"];
for (const n of names) {
  const buf = await sharp(`public/assets/logos/${n}`).resize(360,360,{fit:"contain",background:{r:0,g:0,b:0,alpha:0}}).toBuffer();
  const out = `${OUT}/dark-${n.replace(/[^a-z0-9]/gi,"_")}.png`;
  await sharp({create:{width:400,height:400,channels:4,background:{r:26,g:26,b:46,alpha:1}}}).composite([{input:buf,gravity:"center"}]).png().toFile(out);
  console.log(out);
}
