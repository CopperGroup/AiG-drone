import OrderCard from "@/components/cards/OrderCard";
import { EditUserForm } from "@/components/forms/EditUser";
import { fetchUsersOrdersById } from "@/lib/actions/order.actions";
import { fetchUserByEmail, fetchUserById } from "@/lib/actions/user.actions";
import { getSession } from "@/lib/getServerSession";
import { formatDateString } from "@/lib/utils";

const Page = async ({ params }: { params: { id: string } }) => {
    if(!params.id) {
        return (
            <section className="w-full px-10 py-20 overflow-hidden"> 
                <h1 className="w-full text-heading1-bold drop-shadow-text-blue max-[440px]:text-center">Сторінки не існує</h1>
            </section>
        )
    }

    const email = await getSession();

    if(!email) {
        return
    }

    const user = await fetchUserById(params.id);

    const usersOrders = await fetchUsersOrdersById(params.id);

    const stringifiedCurrentUser = await fetchUserByEmail({ email }, 'json')

    return (
        <section className="w-full px-10 py-20 max-[360px]:px-4 "> 
            <h1 className="w-full text-heading1-bold drop-shadow-text-blue">Користувач {user.username}</h1>
            <div className="w-full pt-3 px-1">
                <div className="w-full mt-20 ">
                    <EditUserForm stringifiedUser={JSON.stringify(user)} stringifiedCurrentUser={stringifiedCurrentUser}/>
                </div>
                <div className="w-full mt-20 mb-20 pb-16">
                    <h2 className="text-heading2-semibold mb-5">Замовлення</h2>
                    {usersOrders.length > 0 ? (
                        <div className="w-full gap-16 grid grid-cols-3 mt-16max-[1900px]:gap-10 max-[1850px]:grid-cols-2 max-[1250px]:grid-cols-1">
                            {usersOrders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    id={order.id}
                                    products={order.products}
                                    user={order.user}
                                    value={order.value}
                                    name={order.name}
                                    surname={order.surname}
                                    phoneNumber={order.phoneNumber}
                                    email={order.email}
                                    paymentType={order.paymentType}
                                    deliveryMethod={order.deliveryMethod}
                                    city={order.city}
                                    adress={order.adress}
                                    postalCode={order.potsalCode}
                                    data={formatDateString(order.data)}
                                    paymentStatus={order.paymentStatus}
                                    deliveryStatus={order.deliveryStatus}
                                    url = '/myOrders/'
                                />
                            ))}
                        </div>
                    ) :
                        <p className="text-body-medium mt-5 ml-1">Замовлень немає</p>}
                </div>
            </div>
        </section>
    )
}

export default Page;