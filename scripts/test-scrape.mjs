function parseRSC(html) {
  const chunks = [];
  const regex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
  let m;
  while ((m = regex.exec(html)) !== null) chunks.push(m[1]);
  return chunks.join('');
}

async function test() {
  const res = await fetch('https://www.techprep.app/problems/two-sum/description?topic=arrays');
  const html = await res.text();
  const rsc = parseRSC(html);

  // Show what the data actually looks like around "description"
  const idx = rsc.indexOf('description');
  if (idx > 0) {
    console.log('Around "description":');
    console.log(rsc.substring(idx, idx + 200));
    console.log('---');
  }

  // Show around "test_cases"
  const tcIdx = rsc.indexOf('test_cases');
  if (tcIdx > 0) {
    console.log('Around "test_cases":');
    console.log(rsc.substring(tcIdx, tcIdx + 200));
    console.log('---');
  }

  // Show around "input_param"
  const ipIdx = rsc.indexOf('input_param');
  if (ipIdx > 0) {
    console.log('Around "input_param":');
    console.log(rsc.substring(ipIdx, ipIdx + 200));
    console.log('---');
  }

  // Solution page
  const solRes = await fetch('https://www.techprep.app/problems/two-sum/solution?topic=arrays');
  const solHtml = await solRes.text();
  const solRsc = parseRSC(solHtml);

  const dsIdx = solRsc.indexOf('display_solution');
  if (dsIdx > 0) {
    console.log('Around "display_solution":');
    console.log(solRsc.substring(dsIdx, dsIdx + 300));
  }
}

test().catch(console.error);
