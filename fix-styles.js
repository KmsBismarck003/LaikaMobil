const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBUSY') filelist.push(dirFile);
    }
  });
  return filelist;
};

const srcDir = path.join(__dirname, 'src');
const files = walkSync(srcDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

let updatedCount = 0;

files.forEach(file => {
  if (file.includes('ThemeProvider') || file.includes('theme.ts') || file.includes('useStyles.ts')) return;
  if (file.includes('Button.tsx')) return; // Already manually fixed
  
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Si ya tiene useStyles, omitir
  if (content.includes('useStyles(')) return;

  // Reemplazar StyleSheet.create
  if (content.includes('const styles = StyleSheet.create({')) {
    content = content.replace(
      'const styles = StyleSheet.create({',
      'const createStyles = (theme: any) => StyleSheet.create({'
    );

    // Importar useStyles si no está
    if (!content.includes('useStyles')) {
      const isSrc = file.includes('screens') || file.includes('components\\ui') || file.includes('components/ui');
      const depth = (file.match(/\\|\//g) || []).length;
      let pathPrefix = '../';
      if (file.includes('ui')) pathPrefix = '../../';
      if (file.includes('screens')) pathPrefix = '../';
      if (file.endsWith('App.tsx')) pathPrefix = './src/';
      
      const lastImport = content.lastIndexOf('import ');
      const nextLine = content.indexOf('\n', lastImport);
      const importPath = file.includes('\\ui\\') || file.includes('/ui/') 
        ? "../../styles/useStyles" 
        : file.includes('screens') || file.includes('components') ? "../styles/useStyles" : "./src/styles/useStyles";
        
      content = content.slice(0, nextLine) + `\nimport { useStyles } from '${importPath}';` + content.slice(nextLine);
    }

    // Inyectar const styles = useStyles(createStyles);
    const componentRegex = /const\s+([A-Z][a-zA-Z0-9_]*)\s*(:\s*React\.FC<[^>]+>)?\s*=\s*\([^)]*\)\s*=>\s*\{/g;
    const match = componentRegex.exec(content);
    if (match) {
      const insertionIndex = match.index + match[0].length;
      content = content.slice(0, insertionIndex) + '\n  const styles = useStyles(createStyles);' + content.slice(insertionIndex);
    } else {
      const funcRegex = /export\s+function\s+([A-Z][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{/g;
      const funcMatch = funcRegex.exec(content);
      if (funcMatch) {
         const insertionIndex = funcMatch.index + funcMatch[0].length;
         content = content.slice(0, insertionIndex) + '\n  const styles = useStyles(createStyles);' + content.slice(insertionIndex);
      }
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log('Updated:', file);
  }
});

console.log(`Updated ${updatedCount} files with useStyles.`);
