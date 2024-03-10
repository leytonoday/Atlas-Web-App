import { useApiQuery } from "@/hooks";
import { services } from "@/services";
import { IPlan, IUser } from "@/types";
import { Drawer, List, Spin } from "antd";

interface IManagePlanUsersProps {
  /**
   * The plan to manage users for.
   */
  plan: IPlan | null;

  /**
   * Whether or not the drawer is open.
   */
  isOpen: boolean;

  /**
   * Callback fired when the drawer is closed.
   */
  onClose: () => void;
}

/**
 * Displays a list of users on a plan.
 */
export const ManagePlanUsers = (props: IManagePlanUsersProps) => {
  const { data: planUsers, isLoading: isLoadingPlanUsers } = useApiQuery<
    IUser[]
  >({
    queryKey: ["allUsersOnPlan", props.plan?.id],
    queryFn: () => services.api.user.getAllUsersOnPlan(props.plan?.id!),
    enabled: props.isOpen && props.plan?.id !== undefined,
  });

  return (
    <Drawer
      title={"Manage Plan Users: " + (props.plan?.name ?? "")}
      placement="right"
      open={props.isOpen}
      onClose={props.onClose}
      width="50%"
    >
      <Spin spinning={isLoadingPlanUsers}>
        <List
          dataSource={planUsers}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                title={item.userName}
                description={`${item.email} | ${item.id}`}
              />
            </List.Item>
          )}
        />
      </Spin>
    </Drawer>
  );
};
