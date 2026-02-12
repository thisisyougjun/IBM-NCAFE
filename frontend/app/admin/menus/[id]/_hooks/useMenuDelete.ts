import { useRouter } from "next/navigation";

export function useMenuDelete(menuId: string) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("정말 이 메뉴를 삭제하시겠습니까?")) {
      return;
    }

    try {
      // TODO: 실제 백엔드 삭제 API 호출
      // const response = await fetch(`/api/admin/menus/${menuId}`, {
      //   method: 'DELETE',
      // });
      //
      // if (!response.ok) {
      //   throw new Error('삭제 실패');
      // }

      alert("메뉴가 삭제되었습니다.");
      router.push("/admin/menus");
    } catch (error) {
      console.error("메뉴 삭제 실패:", error);
      alert("메뉴 삭제 중 오류가 발생했습니다.");
    }
  };

  return { handleDelete };
}
