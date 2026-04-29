export type Language = 'en' | 'zh';

export const translations = {
  en: {
    app: {
      title: 'Smart Bookmark Manager',
      subtitle: 'Intelligent and organized bookmark management tool',
    },
    buttons: {
      addBookmark: 'Add Bookmark',
      addGroup: 'Add Group',
    },
    settings: {
      title: 'Settings',
      themeAndPersonalization: 'Theme & Personalization',
      importExport: 'Import/Export',
    },
    common: {
      title: 'Smart Bookmark Manager',
      description: 'Intelligent and organized bookmark management tool',
      addBookmark: 'Add Bookmark',
      addGroup: 'Add Group',
      search: 'Search',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      import: 'Import',
      export: 'Export',
      importExport: 'Import/Export',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      move: 'Move',
      confirm: 'Confirm',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
    },
    empty: {
      title: 'Start Building Your Personal Navigation',
      description: 'Add bookmarks and groups to create an efficient personal workspace',
      addFirstBookmark: 'Add First Bookmark',
      createGroup: 'Create Group',
      or: 'or',
      importFromBrowser: 'Import from Browser',
      quickStart: {
        title: 'Quick Start Guide',
        addBookmark: 'Add individual bookmarks directly',
        createGroup: 'Create groups to organize related bookmarks',
        importBookmarks: 'Import existing bookmarks from browser',
        dragAndDrop: 'Drag and drop to adjust bookmark and group order',
      },
    },
    dialog: {
      addBookmark: {
        title: 'Add Bookmark',
        url: 'URL',
        name: 'Name (Optional)',
        namePlaceholder: 'Leave blank to auto-fetch page title',
        group: 'Group (Optional)',
        selectGroup: 'Select a group or leave empty for standalone',
      },
      editBookmark: {
        title: 'Edit Bookmark',
        url: 'URL',
        name: 'Name',
      },
      addGroup: {
        title: 'Add Group',
        description: 'Create a new group container where you can drag and drop bookmarks for organization.',
      },
      deleteBookmarks: {
        title: 'Clear Standalone Bookmarks',
        description: 'Are you sure you want to delete all standalone bookmarks? This action will delete all bookmarks and cannot be undone.',
        emptyDescription: 'Current no bookmarks to delete',
      },
      deleteBookmark: {
        title: 'Delete Bookmark',
        description: 'Are you sure you want to delete "{name}"?',
      },
      deleteGroup: {
        title: 'Delete Group',
        description: 'Delete group "{name}" with {count} bookmark(s)?',
        emptyDescription: 'Delete group "{name}"?',
        deleteAll: 'Delete all',
        moveToStandalone: 'Move to standalone',
      },
    },
    import: {
      title: 'Import Bookmarks',
      fromFile: {
        title: 'Import from File',
        description: 'Import from browser exported bookmarks or backup files',
        label: 'Choose a file to import',
        button: 'Select File'
      },
      fromPaste: {
        title: 'Import from Paste',
        description: 'Paste bookmark data or JSON backup data',
        label: 'Paste Data',
        placeholder: 'Paste HTML bookmarks or JSON data here...'
      },
      button: 'Import Data',
      success: 'Data imported successfully!',
      browserSuccess: 'Browser bookmarks imported successfully!',
      newGroup: 'New Group',
      untitledBookmark: 'Untitled Bookmark',
      importedBookmarks: 'Imported Bookmarks',
      errors: {
        failed: 'Import failed',
        missingGroups: 'Invalid data format: missing groups array',
        missingBookmarks: 'Invalid data format: missing standalone bookmarks array',
        invalidGroup: 'Group {index} has invalid format'
      }
    },
    export: {
      title: 'Export Bookmarks',
      toJSON: {
        title: 'Export as JSON',
        description: 'Export as JSON format for complete backup'
      },
      toHTML: {
        title: 'Export as HTML',
        description: 'Export as HTML format for browser import'
      },
      standaloneGroup: 'Standalone Bookmarks'
    },
    bookmarks: {
      url: 'URL',
      title: 'Title',
      description: 'Description',
      group: 'Group',
      noGroup: 'No Group',
      addToGroup: 'Add to Group',
      removeFromGroup: 'Remove from Group',
    },
    groups: {
      name: 'Group Name',
      defaultName: 'New Group',
      description: 'Group Description',
      parent: 'Parent Group',
      noParent: 'No Parent Group',
    },
    search: {
      placeholder: 'Search bookmarks...',
      noResults: 'No matching bookmarks found',
    },
    theme: {
      title: 'Theme Mode',
      light: 'Light',
      dark: 'Dark',
      typography: {
        title: 'Typography',
        fontSize: 'Font Size',
        small: 'Small (14px)',
        medium: 'Medium (16px)',
        large: 'Large (18px)',
      },
      reset: 'Reset to Default Theme',
    },
    bookmarkSection: {
      standalone: 'Standalone Bookmarks',
      groupName: 'Group Name',
    },
    group: {
      emptyState: 'Drag bookmarks here or click + to add',
    },
    standalone: {
      title: 'Standalone Bookmarks',
      emptyState: 'Drag bookmarks here or click + to add',
      addFirst: 'Add First Bookmark',
    },
    dragAndDrop: {
      moveToStandalone: 'Release to move to Standalone Bookmarks',
      dragToReorder: 'Drag to reorder groups',
    },
    batchMove: {
      title: 'Batch Move Bookmarks',
      targetGroup: 'Target Group',
      selectGroup: 'Select a group',
      selectedBookmarks: 'Selected Bookmarks',
      emptyGroup: 'No bookmarks in this group to move',
    },
  },
  zh: {
    app: {
      title: '智能书签管理器',
      subtitle: '智能且有序的书签管理工具',
    },
    buttons: {
      addBookmark: '添加书签',
      addGroup: '添加分组',
    },
    settings: {
      title: '设置',
      themeAndPersonalization: '主题与个性化',
      importExport: '导入/导出',
    },
    common: {
      title: '智能书签管理器',
      description: '智能且有序的书签管理工具',
      addBookmark: '添加书签',
      addGroup: '添加分组',
      search: '搜索',
      settings: '设置',
      language: '语言',
      theme: '主题',
      import: '导入',
      export: '导出',
      importExport: '导入/导出',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      move: '移动',
      confirm: '确定',
      selectAll: '全选',
      deselectAll: '反选',
    },
    empty: {
      title: '开始构建您的专属导航',
      description: '添加书签和分组，打造高效的个人工作台',
      addFirstBookmark: '添加第一个书签',
      createGroup: '创建分组',
      or: '或者',
      importFromBrowser: '从浏览器导入书签',
      quickStart: {
        title: '快速上手指南',
        addBookmark: '直接添加单个书签',
        createGroup: '创建分组来组织相关书签',
        importBookmarks: '从浏览器导入现有书签',
        dragAndDrop: '拖拽调整书签和分组顺序',
      },
    },
    dialog: {
      addBookmark: {
        title: '添加书签',
        url: '网址 (URL)',
        name: '名称 (可选)',
        namePlaceholder: '留空将自动获取网页标题',
        group: '分组 (可选)',
        selectGroup: '选择一个分组或留空作为独立书签',
      },
      editBookmark: {
        title: '编辑书签',
        url: '网址 (URL)',
        name: '名称',
      },
      addGroup: {
        title: '添加分组',
        description: '将创建一个新的分组容器，您可以将书签拖拽到其中进行分类管理。',
      },
      deleteBookmarks: {
        title: '清空独立书签',
        description: '确定要删除所有独立书签吗？此操作将删除所有书签，且无法撤销。',
        emptyDescription: '当前没有可删除的书签',
      },
      deleteBookmark: {
        title: '删除书签',
        description: '确定要删除书签 "{name}" 吗？',
      },
      deleteGroup: {
        title: '删除分组',
        description: '删除分组 "{name}" 吗？请选择如何处理 {count} 个书签：',
        emptyDescription: '确定要删除分组 "{name}" 吗？',
        deleteAll: '删除所有',
        moveToStandalone: '移动到独立书签',
      },
    },
    import: {
      title: '导入书签',
      fromFile: {
        title: '从文件导入',
        description: '从浏览器导出的书签文件或备份文件导入',
        label: '选择要导入的文件',
        button: '选择文件'
      },
      fromPaste: {
        title: '粘贴数据导入',
        description: '粘贴书签数据或 JSON 格式的备份数据',
        label: '粘贴数据',
        placeholder: '在此粘贴 HTML 书签或 JSON 数据...'
      },
      button: '导入数据',
      success: '数据导入成功！',
      browserSuccess: '浏览器书签导入成功！',
      newGroup: '新建分组',
      untitledBookmark: '未命名书签',
      importedBookmarks: '导入的书签',
      errors: {
        failed: '导入失败',
        missingGroups: '无效的数据格式：缺少 groups 数组',
        missingBookmarks: '无效的数据格式：缺少 standaloneBookmarks 数组',
        invalidGroup: '分组 {index} 数据格式错误'
      }
    },
    export: {
      title: '导出书签',
      toJSON: {
        title: '导出为 JSON',
        description: '导出为 JSON 格式用于完整备份'
      },
      toHTML: {
        title: '导出为 HTML',
        description: '导出为 HTML 格式用于浏览器导入'
      },
      standaloneGroup: '独立书签'
    },
    bookmarks: {
      url: '网址',
      title: '标题',
      description: '描述',
      group: '分组',
      noGroup: '无分组',
      addToGroup: '添加到分组',
      removeFromGroup: '从分组移除',
    },
    groups: {
      name: '分组名称',
      defaultName: '新建分组',
      description: '分组描述',
      parent: '父分组',
      noParent: '无父分组',
    },
    search: {
      placeholder: '搜索书签...',
      noResults: '没有找到匹配的书签',
    },
    theme: {
      title: '主题模式',
      light: '浅色',
      dark: '深色',
      typography: {
        title: '字体设置',
        fontSize: '字体大小',
        small: '小 (14px)',
        medium: '中 (16px)',
        large: '大 (18px)',
      },
      reset: '重置为默认主题',
    },
    bookmarkSection: {
      standalone: '独立书签',
      groupName: '分组名称',
    },
    group: {
      emptyState: '拖拽书签到此处或点击上方 + 按钮添加',
    },
    standalone: {
      title: '独立书签',
      emptyState: '拖拽书签到此处或点击 + 添加',
      addFirst: '添加第一个书签',
    },
    dragAndDrop: {
      moveToStandalone: '释放以移动到独立书签',
      dragToReorder: '拖拽以重新排列分组',
    },
    batchMove: {
      title: '批量移动书签',
      targetGroup: '目标分组',
      selectGroup: '选择一个分组',
      selectedBookmarks: '已选择的书签',
      emptyGroup: '该分组下没有书签可移动',
    },
  },
} as const; 