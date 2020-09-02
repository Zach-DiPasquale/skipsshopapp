import { getConnection } from "typeorm";
import { UpdateStatus, Status } from "../../database/models/UpdateStatus";

export const getAllUpdates = async (t) => {
  return await getConnection()
    .getRepository(UpdateStatus)
    .createQueryBuilder("updateStatus")
    .where("updateStatus.startingTime = :t", { t: t })
    .getAll();
};

export const createStatus = async (status) => {
  return await getConnection()
    .createQueryBuilder()
    .insert()
    .into(UpdateStatus)
    .values(status)
    .execute()
    .then((r) => r.identifiers[0].id);
};

export const updateStatus = async (s) => {
  return await getConnection()
    .createQueryBuilder()
    .update(UpdateStatus)
    .set({
      status: s.status,
      message: s.message,
      productName: s.productName,
    })
    .where("id = :id", { id: s.id })
    .execute();
};

export const getFailuresSince = async (ct) => {
  let failures = await getConnection()
    .getRepository(UpdateStatus)
    .createQueryBuilder("update_status")
    .where(
      "update_status.startingTime >= :ct AND update_status.status = :status",
      { ct: ct, status: Status.FAILURE }
    )
    .getMany();
  return failures;
};
