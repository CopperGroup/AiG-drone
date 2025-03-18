import { fetchUserByEmail, fetchUsers } from "@/lib/actions/user.actions";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { AddClientButton } from "@/components/admin-components/clients/AddClientButton";
import { getSession } from "@/lib/getServerSession";

const Page = async () => {

    const users = await fetchUsers();

    const email = await getSession();

    const stringifiedUser = await fetchUserByEmail({ email }, 'json')

    if(!stringifiedUser) {
        return
    }

    return (
        <section className="w-full px-10 py-20 max-[360px]:px-4"> 
            <h1 className="w-full text-heading1-bold drop-shadow-text-blue">Користувачі</h1>
            <DataTable columns={columns} data={users}/>
            <AddClientButton stringifiedUser={stringifiedUser}/>
        </section>
    )
}

export default Page;