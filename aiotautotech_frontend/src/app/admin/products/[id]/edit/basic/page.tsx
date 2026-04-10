import { EditProductPageContent } from '../page';

export default function EditProductBasicPage() {
  return (
    <EditProductPageContent
      initialTab="basic"
      showTabsHeader={false}
      showFooter={false}
      pageTitle="Basic Information"
    />
  );
}
