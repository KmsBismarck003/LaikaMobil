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

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Reemplazar imports
  if (content.includes("import { theme } from '../../styles/theme'")) {
    content = content.replace(
      "import { theme } from '../../styles/theme'",
      "import { useAppTheme } from '../../styles/ThemeProvider'"
    );
  } else if (content.includes("import { theme } from '../styles/theme'")) {
    content = content.replace(
      "import { theme } from '../styles/theme'",
      "import { useAppTheme } from '../styles/ThemeProvider'"
    );
  } else if (content.includes("import { theme } from '../../../styles/theme'")) {
    content = content.replace(
      "import { theme } from '../../../styles/theme'",
      "import { useAppTheme } from '../../../styles/ThemeProvider'"
    );
  }

  // Comprobar si se importó useAppTheme pero no se está extrayendo { theme }
  if (content.includes('useAppTheme') && !content.includes('const { theme }') && !content.includes('const { theme, isDark }')) {
    // Buscar la primera declaración de componente para inyectar el hook
    const componentRegex = /const\s+([A-Z][a-zA-Z0-9_]*)\s*(:\s*React\.FC<[^>]+>)?\s*=\s*\([^)]*\)\s*=>\s*\{/g;
    const match = componentRegex.exec(content);
    if (match) {
      const insertionIndex = match.index + match[0].length;
      content = content.slice(0, insertionIndex) + '\n  const { theme } = useAppTheme();' + content.slice(insertionIndex);
    } else {
      // Intentar export function
      const funcRegex = /export\s+function\s+([A-Z][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{/g;
      const funcMatch = funcRegex.exec(content);
      if (funcMatch) {
         const insertionIndex = funcMatch.index + funcMatch[0].length;
         content = content.slice(0, insertionIndex) + '\n  const { theme } = useAppTheme();' + content.slice(insertionIndex);
      }
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log('Updated:', file);
  }
});

console.log(`Updated ${updatedCount} files.`);
