/**
 * 统一瞬时提示。使用全局 toast，避免在表单/弹窗内容区插入提示导致布局位移。
 */
export function useNotify() {
  const toast = useToast()

  function success(title: string, description?: string) {
    toast.add({ title, description, color: 'success' })
  }

  function error(title: string) {
    toast.add({ title, color: 'error' })
  }

  return { success, error }
}
