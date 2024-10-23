window.MathJax = {
  loader: {load: ['[tex]/mhchem', '[tex]/chemfig', '[tex]/color']},
  
  tex: {
    packages: {'[+]': ['mhchem', 'chemfig', 'color']},

    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  }
};

document$.subscribe(() => { 
  MathJax.startup.output.clearCache()
  MathJax.typesetClear()
  MathJax.texReset()
  MathJax.typesetPromise()
})