'use client';

const OwnerContent = ({ role, children }: { role: string, children: React.ReactNode }) => {

    if (role !== "Owner") {
        return null;
    }
    
    return <>{children}</>;
};

export default OwnerContent;
