import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const curriculumDir = path.join(__dirname, 'curriculum')
const distDir = path.join(__dirname, 'dist')

// 1. Clean and prepare dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true })
}
fs.mkdirSync(distDir, { recursive: true })

// 2. Copy Hub index.html to dist root
fs.copyFileSync(path.join(__dirname, 'hub', 'index.html'), path.join(distDir, 'index.html'))
console.log('✅ Copied Course Hub to dist/index.html')

// 3. Find all chapters
const chapters = fs.readdirSync(curriculumDir).filter(f => fs.statSync(path.join(curriculumDir, f)).isDirectory())

for (const chapter of chapters) {
  const chapterDir = path.join(curriculumDir, chapter)
  const files = fs.readdirSync(chapterDir).filter(f => f.endsWith('.md'))
  
  for (const file of files) {
    const lessonName = file.replace('.md', '')
    // e.g. ch04-trigonometry -> ch04
    const shortChapter = chapter.split('-')[0]
    
    const targetPath = path.posix.join(shortChapter, lessonName)
    const outDir = path.join(distDir, targetPath)
    
    // Create base URL for GitHub Pages (e.g. /KirkAmosPrecalc/ch04/4.2-unit-circle/)
    const baseUrl = `/KirkAmosPrecalc/${targetPath}/`
    
    console.log(`\n🚀 Building ${file} -> ${targetPath}...`)
    
    // Run slidev build
    const mdPath = path.join('curriculum', chapter, file)
    try {
      execSync(`npx slidev build "${mdPath}" --base "${baseUrl}" --out "${outDir}"`, { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      })
      console.log(`✅ Built ${lessonName}`)
    } catch (err) {
      console.error(`❌ Failed to build ${lessonName}`)
      process.exit(1)
    }
  }
}

console.log('\n🎉 All presentations built successfully!')
