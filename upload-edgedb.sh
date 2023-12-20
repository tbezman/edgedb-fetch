# Archive the Git repository as a tarball
git archive --format=tar HEAD | gzip > /tmp/repo.tar.gz

# Copy the tarball to the remote server using SCP
scp /tmp/repo.tar.gz root@159.203.182.58:/root/repo.tar.gz

# SSH into the remote server and unzip the tarball
ssh root@159.203.182.58 "cd /home/edgedb; rm -rf edgedb-fetch; mkdir edgedb-fetch; tar -xzf /root/repo.tar.gz -C /home/edgedb/edgedb-fetch"
