
#initialize postgresql (with md5 host auth)
su - postgres -c "/usr/pgsql-9.4/bin/initdb --auth-host=md5"

#start postgresql
chkconfig postgresql-9.4 on
service postgresql-9.4 start #will fail if v8 is already running on port 5432

#create mca user/db
echo $RANDOM.$RANDOM.$RANDOM > /root/mca.pgpasswd
su - postgres -c "psql -c \"CREATE ROLE mca PASSWORD '$(cat /root/mca.pgpasswd)' CREATEDB INHERIT LOGIN;\""
su - postgres -c "psql -c \"CREATE DATABASE mcadmin OWNER mca\""
echo "//autogeneated by mca rpm" > /opt/mca/mca/api/config/db.js
echo "module.exports = 'postgres://mca:$(cat /root/mca.pgpasswd)@localhost/mcadmin'" >> /opt/mca/mca/api/config/db.js
rm /root/mca.pgpasswd

#generate service tokens
cd /opt/mca/auth/api/config && ./genkey.sh
cd /opt/mca/auth/bin && ./auth.js issue --scopes '{ "mca": [] }' --sub 'mca_service' --out /opt/mca/mca/api/config/profile.jwt
#TODO - limit access for generated keys to mca user

#need to disable mod_ssl default conf
mv /etc/httpd/conf.d/ssl.conf /etc/httpd/conf.d/ssl.conf.disabled

#now I should be able to start everything
#su - mca -c "pm2 start /opt/mca/mca/deploy/mca.json"
#su - mca -c "pm2 save"

#persist pm2 session over reboot
#TODO - this somehow hoses up the script when run from init script
#pm2 startup redhat -u mca

#install igtf certs
mkdir -p /etc/grid-security/certificates
cd /etc/grid-security/certificates && wget https://dist.igtf.net/distribution/current/accredited/igtf-preinstalled-bundle-classic-1.70.tar.gz && tar -xzf *.tar.gz

service httpd start
chkconfig httpd on

service mca start
