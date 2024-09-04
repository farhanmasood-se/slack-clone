interface WorkspaceIdPageProps {
  params: {
    workspaceId: string;
  };
}

const WorkspaceIdPage = ({ params: { workspaceId } }: WorkspaceIdPageProps) => {
  return <div>{workspaceId}</div>;
};

export default WorkspaceIdPage;
