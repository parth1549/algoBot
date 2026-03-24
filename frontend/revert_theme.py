import os
import re

directories = ['app', 'components']
base_path = r'c:\Users\parth\OneDrive\Desktop\algoProject\frontend'

replacements = {
    r'\bbg-white dark:bg-slate-900\b': 'bg-slate-900',
    r'\bbg-white/50 dark:bg-slate-900/50\b': 'bg-slate-900/50',
    r'\bbg-gray-50 dark:bg-slate-800\b': 'bg-slate-800',
    r'\bbg-gray-100/50 dark:bg-slate-800/10\b': 'bg-slate-800/10',
    r'\bbg-gray-50 dark:bg-slate-800/20\b': 'bg-slate-800/20',
    r'\bbg-gray-50 dark:bg-slate-800/40\b': 'bg-slate-800/40',
    r'\bbg-gray-100 dark:bg-slate-800/50\b': 'bg-slate-800/50',
    r'\bbg-gray-100 dark:bg-slate-800/60\b': 'bg-slate-800/60',
    r'\bbg-gray-200 dark:bg-slate-700\b': 'bg-slate-700',
    r'\bbg-gray-200/50 dark:bg-slate-700/50\b': 'bg-slate-700/50',
    r'\bbg-gray-300 dark:bg-slate-600\b': 'bg-slate-600',
    
    r'\bhover:bg-gray-100 dark:hover:bg-slate-800\b': 'hover:bg-slate-800',
    r'\bhover:bg-gray-100/80 dark:hover:bg-slate-800/50\b': 'hover:bg-slate-800/50',
    r'\bhover:bg-gray-100/90 dark:hover:bg-slate-800/60\b': 'hover:bg-slate-800/60',
    r'\bhover:bg-gray-200 dark:hover:bg-slate-700\b': 'hover:bg-slate-700',
    r'\bhover:bg-gray-200/80 dark:hover:bg-slate-700/50\b': 'hover:bg-slate-700/50',

    r'\bborder-gray-200 dark:border-slate-800\b': 'border-slate-800',
    r'\bborder-gray-200 dark:border-slate-700\b': 'border-slate-700',
    r'\bborder-gray-200/80 dark:border-slate-700/50\b': 'border-slate-700/50',
    r'\bborder-gray-300 dark:border-slate-600\b': 'border-slate-600',
    r'\bhover:border-gray-300 dark:hover:border-slate-600\b': 'hover:border-slate-600',
    
    r'\btext-gray-900 dark:text-slate-200\b': 'text-slate-200',
    r'\btext-gray-800 dark:text-slate-200/90\b': 'text-slate-200/90',
    r'\btext-gray-800 dark:text-slate-300\b': 'text-slate-300',
    r'\btext-gray-600 dark:text-slate-400\b': 'text-slate-400',
    r'\btext-gray-500 dark:text-slate-500\b': 'text-slate-500',
    r'\btext-gray-900 dark:text-white\b': 'text-white',
    r'\bhover:text-gray-900 dark:hover:text-white\b': 'hover:text-white',
    r'\bhover:text-gray-800 dark:hover:text-slate-200\b': 'hover:text-slate-200',
    r'\bhover:text-gray-700 dark:hover:text-slate-300\b': 'hover:text-slate-300',
}

files_modified = 0

for d in directories:
    dir_path = os.path.join(base_path, d)
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.jsx'):
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                new_content = content
                for pattern, replacement in replacements.items():
                    new_content = re.sub(pattern, replacement, new_content)

                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    files_modified += 1
                    print(f"Modified: {file_path}")

print(f"\nDone! Reverted {files_modified} files.")
