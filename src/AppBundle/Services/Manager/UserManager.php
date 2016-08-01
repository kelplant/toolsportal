<?php
namespace AppBundle\Services\Manager;

use AppBundle\Services\Manager\AbstractManager;
use Symfony\Bridge\Doctrine\ManagerRegistry;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Validator\Constraints\DateTime;
use Doctrine\Common\Util\Inflector;
/**
 * Class UserManager
 * @package AppBundle\Services\Manager
 */
class UserManager extends AbstractManager
{
    /**
     * @param $itemLoad
     * @return mixed
     */
    public function createArray($itemLoad)
    {
        $itemToTransform = $this->getRepository()->findOneById($itemLoad);

        $itemArray = [];

        $itemArray['id']       = $itemToTransform->getId();
        $itemArray['username'] = $itemToTransform->getUsername();
        $itemArray['email']    = $itemToTransform->getEmail();
        $itemArray['roles']    = $itemToTransform->getRoles();
        $itemArray['enabled']  = $itemToTransform->isEnabled();

        return $itemArray;
    }

    /**
     * @param $itemToEditId
     * @param $ContentToAddToEditedItem
     * @return array
     */
    public function edit($itemToEditId, $ContentToAddToEditedItem) {
        try {
            $itemToSet = $this->globalSetItem($this->getRepository()->findOneById($itemToEditId), $ContentToAddToEditedItem);
            $this->em->flush();
            $this->appendSessionMessaging(array('errorCode' => 0, 'message' => $this->argname.' a eté correctionement Mis(e) à jour'));
        } catch (\Exception $e) {
            $this->appendSessionMessaging(array('errorCode' => error_log($e->getMessage()), 'message' => $e->getMessage()));
        }
        return array('item' => $itemToEditId);
    }

    /**
     * @param $itemToSet
     * @param $itemLoad
     * @return object
     */
    public function globalSetItem($itemToSet, $itemLoad)
    {
        $roles = [];
        $roles[] = $itemLoad['roles'];

        $itemToSet->setUsername($itemLoad['username']);
        $itemToSet->setUsernameCanonical($itemLoad['username']);

        $itemToSet->setEmail($itemLoad['email']);
        $itemToSet->setEmailCanonical($itemLoad['email']);

        $itemToSet->setRoles($roles);

        if (!isset($itemLoad['enabled'])) {
            $enabled = 0;
        } else if (isset($itemLoad['enabled']) && $itemLoad['enabled'] == true) {
            $enabled = 1;
        } else {
            $enabled = 0;
        }
        $itemToSet->setEnabled($enabled);

        return $itemToSet;
    }


}