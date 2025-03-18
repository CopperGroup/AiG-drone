import FetchUrl from "@/components/admin-components/parseXML/FetchUrl";
import XMLParser from "@/components/admin-components/parseXML/XMLParser";
import XmlProcessor from "@/components/admin-components/parseXML/XMLProcessor";
import { XmlParserProvider } from "../context";

const Page = async () => {


  return (
    <section className="w-full px-10 max-[400px]:px-4"> 
      {/* <h2 className="text-heading1-bold pr-2 drop-shadow-text-blue mb-8">Додайте товар посиланням</h2> */}
      <div className="w-full pb-10">
        <XmlParserProvider>
          <XMLParser />
        </XmlParserProvider>
        {/* <FetchUrl /> */}
      </div>
    </section>
  )
}

export default Page;
