import {
  compose,
  localServer,
  pgadmin,
  postgres,
  service,
  writeCompose,
} from '@january/docker';

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