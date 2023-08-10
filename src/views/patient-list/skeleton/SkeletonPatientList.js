import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const getSkeletonRounded = (index) => {
  return <Skeleton key={index.toString()} variant="rounded" width="100%" height={60} />;
};

const arr = [];
for (let index = 0; index < 10; index++) {
  arr.push(getSkeletonRounded(index));
}

const SkeletonPatientList = () => {
  return (
    <Stack spacing={1}>
      <Skeleton variant="rounded" width={210} height={60} />
      {arr.map((element) => element)}
    </Stack>
  );
};

export default SkeletonPatientList;
