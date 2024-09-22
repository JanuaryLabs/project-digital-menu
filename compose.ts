import { compose, service, toKevValEnv } from '@january/docker';
import { writeCompose } from '@january/extensions';
import { localServer } from '@january/extensions/fly';
import { postgres, pgadmin } from '@january/extensions/postgresql';

writeCompose(
  compose({
    database: service(postgres),
    pgadmin: service(pgadmin),
    server: service({
      ...localServer(),
      depends_on: [postgres],
    }),
  }),
);